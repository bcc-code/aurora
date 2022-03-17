package main

import (
	"fmt"
	"net/http"
	"time"

	"cloud.google.com/go/firestore"
	"github.com/gin-gonic/gin"
	"go.bcc.media/bcco-api/firebase"
	"go.bcc.media/bcco-api/log"
	"go.bcc.media/bcco-api/mediabank"
	"go.bcc.media/bcco-api/members"
	"go.bcc.media/bcco-api/pubsub"
	"go.opencensus.io/trace"
)

// MembersWebhook handles the pubsub notification
// StatusNoContent is used to ACK messages that we do not want retried even if the
// actual staus is a permanent error
func (s Server) MembersWebhook(c *gin.Context) {
	ctx, t := trace.StartSpan(c.Request.Context(), "MembersWebhook")
	defer t.End()

	msg, err := pubsub.MessageFromCtx(c)
	if err != nil {
		data, _ := c.GetRawData()
		log.L.Info().
			Str("body", string(data)).
			Err(err).
			Msg("Malformed request")
		c.JSON(http.StatusNoContent, map[string]string{"message": "Malformed request 1"})
		return
	}

	if !msg.Validate(s.membersWebhookSecret) {
		log.L.Debug().
			Str("data", msg.Message.Data).
			Str("msg", fmt.Sprintf("%+v", msg)).
			Msg("Invalid HMAC")
		c.JSON(http.StatusOK, gin.H{"error": "Message not signed correctly"})
		return
	}

	updatedMemebers := []members.Member{}
	err = msg.ExtractDataInto(&updatedMemebers)
	if err != nil {
		log.L.Info().
			Err(err).
			Str("data", msg.Message.Data).
			Msg("Malformed request")
		c.JSON(http.StatusOK, map[string]string{"message": "Malformed request 2"})
		return
	}

	seenChurches := map[int]bool{}

	for i, person := range updatedMemebers {
		err = firebase.UpdateOrCreateUser(c.Request.Context(), s.fs, &person)

		if err != nil {
			log.L.Error().
				Err(err).
				Int("person_id", person.PersonID).
				Int("i", i).
				Msg("Error when updating user")
			continue
			// We just log the errors, for now as it it unlikely that we will be able to do
			// better in a retry
		}

		log.L.Debug().
			Int("person_id", person.PersonID).
			Msg("Updated person")

		go s.analyticsClient.Identify(float64(person.PersonID))

		// Do not update too many times. There will still be multiple updates, but
		// at least not in a single request
		if _, ok := seenChurches[person.Church.Org.ChurchID]; !ok {
			seenChurches[person.Church.Org.ChurchID] = true
			ch := firebase.Church{}
			ch = ch.UpdateFromMembers(&person.Church.Org)
			err = ch.Upsert(ctx, s.fs)

			// Good to know but we should not delay because of that. Not an integral part
			if err != nil {
				log.L.Warn().
					Err(err).
					Str("churchId", person.Church.ID).
					Msg("Error when updating church")
			}
		}
	}

	// We have to return a 2xx code regardless of the actual success as we don't want to get the message again
	c.Status(http.StatusNoContent)
}

// MediabankWebhookEventData accepts event data from mediabanken and
// adds it to the current running event
func (s Server) MediabankWebhookEventData(c *gin.Context) {
	ctx, t := trace.StartSpan(c.Request.Context(), "MediabankWebhookEventData")
	defer t.End()

	data := mediabank.EventData{}
	err := c.BindJSON(&data)

	if err != nil {
		log.L.Info().
			Err(err).
			Msg("Malformed request")
		c.JSON(http.StatusBadRequest, map[string]string{"message": "Malformed request"})
		return
	}

	configRaw, err := s.fs.Doc("configs/brunstadtv-app").Get(ctx)
	if err != nil {
		log.L.Info().
			Err(err).
			Msg("Firebase failed")
		c.JSON(http.StatusServiceUnavailable, map[string]string{"message": "FB issues"})
		return
	}

	config := firebase.BTVAppConfig{}
	err = configRaw.DataTo(&config)
	if err != nil {
		log.L.Info().
			Err(err).
			Msg("Can't parse BTV config object")
		c.JSON(http.StatusInternalServerError, map[string]string{"message": "FB issues"})
		return
	}

	if config.CurrentEventPath == nil {
		c.JSON(http.StatusNotFound, map[string]string{"message": "No BCCO Event in progress"})
		return
	}

	data.StartTime, err = time.Parse(time.RFC3339, data.StartTimeISO)

	if err != nil {
		log.L.Info().
			Err(err).
			Str("IsoTimeStart", data.StartTimeISO).
			Msg("Unable to parse time")
		c.JSON(http.StatusInternalServerError, map[string]string{"message": "Bad time format. Please adhere to RFC3339"})
		return
	}

	_, err = config.CurrentEventPath.Update(ctx, []firestore.Update{
		{Path: "mediabankID", Value: data.VidispineID},
		{Path: "mediabankFileName", Value: data.Filename},
		{Path: "mediabankStartTime", Value: data.StartTime},
		{Path: "mediabankFps", Value: data.Fps},
	})

	if err != nil {
		log.L.Info().
			Err(err).
			Str("EventID", config.CurrentEventPath.ID).
			Str("mediabankID", data.VidispineID).
			Str("mediabankFileName", data.Filename).
			Time("mediabankStartTimestamp", data.StartTime).
			Str("mediabankFps", data.Fps).
			Msg("Unable to update")
		c.JSON(http.StatusInternalServerError, map[string]string{"message": "FB issues"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Updated event", "event_id": config.CurrentEventPath.ID})
}
