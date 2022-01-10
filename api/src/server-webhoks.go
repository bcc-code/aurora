package main

import (
	"fmt"
	"net/http"

	"cloud.google.com/go/firestore"
	"github.com/gin-gonic/gin"
	"go.bcc.media/bcco-api/firebase"
	"go.bcc.media/bcco-api/log"
	"go.bcc.media/bcco-api/mediabank"
	"go.bcc.media/bcco-api/members"
	"go.bcc.media/bcco-api/pubsub"
)

// MembersWebhook handles the pubsub notification
// StatusNoContent is used to ACK messages that we do not want retried even if the
// actual staus is a permanent error
func (s Server) MembersWebhook(c *gin.Context) {
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

		// Do not update too many times. There will still be multiple updates, but
		// at least not in a single request
		if _, ok := seenChurches[person.Church.Org.ChurchID]; !ok {
			seenChurches[person.Church.Org.ChurchID] = true
			ch := firebase.Church{}
			ch = ch.UpdateFromMembers(&person.Church.Org)
			err = ch.Upsert(c.Request.Context(), s.fs)

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
	data := mediabank.EventData{}
	err := c.BindJSON(&data)

	if err != nil {
		log.L.Info().
			Err(err).
			Msg("Malformed request")
		c.JSON(http.StatusBadRequest, map[string]string{"message": "Malformed request"})
		return
	}

	ctx := c.Request.Context()

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

	_, err = config.CurrentEventPath.Update(ctx, []firestore.Update{
		{Path: "mediabankID", Value: data.VidispineID},
		{Path: "mediabankFileName", Value: data.Filename},
	})

	if err != nil {
		log.L.Info().
			Err(err).
			Str("EventID", config.CurrentEventPath.ID).
			Str("mediabankID", data.VidispineID).
			Str("mediabankFileName", data.Filename).
			Msg("Unable to update")
		c.JSON(http.StatusInternalServerError, map[string]string{"message": "FB issues"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Updated event", "event_id": config.CurrentEventPath.ID})
}
