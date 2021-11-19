package main

import (
	"net/http"

	"cloud.google.com/go/firestore"
	"github.com/gin-gonic/gin"
	"go.bcc.media/bcco-api/analytics"
	"go.bcc.media/bcco-api/firebase"
	"go.bcc.media/bcco-api/log"
	"go.bcc.media/bcco-api/members"
	"go.bcc.media/bcco-api/pubsub"
)

// ServerConfig for easier config of new server
type ServerConfig struct {
	AnalyticsClient *analytics.Client

	FirestoreClient *firestore.Client

	HTTPClient *http.Client

	MembersWebhookSecret string
	MembersClient        *members.Client

	CollectionAPIKey  string
	CollectionBaseURL string

	AnalitycsIDSecret string
}

// Server holds shared resources for the webserver
// so they can be accessed by all requests
type Server struct {
	fs              *firestore.Client
	analyticsClient *analytics.Client

	members              *members.Client
	membersWebhookSecret string
	analyticsIDSecret    string
	httpClient           *http.Client

	collectionBaseURL string
	collectionAPIKey  string
}

// NewServer with embedded shared resources
func NewServer(c ServerConfig) *Server {
	return &Server{
		fs:                   c.FirestoreClient,
		members:              c.MembersClient,
		membersWebhookSecret: c.MembersWebhookSecret,
		analyticsClient:      c.AnalyticsClient,
		httpClient:           c.HTTPClient,
		collectionBaseURL:    c.CollectionBaseURL,
		collectionAPIKey:     c.CollectionAPIKey,
		analyticsIDSecret:    c.AnalitycsIDSecret,
	}
}

// UpdatePersonRequest for parsing the PubSub message
type UpdatePersonRequest struct {
	PersonID string `json:"person_id"`
}

// UpdatePersonFromMembers handles the pubsub notification
// StatusNoContent is used to ACK messages that we do not want retried even if the
// actual staus is a permanent error
func (s Server) UpdatePersonFromMembers(c *gin.Context) {
	msg, err := pubsub.MessageFromCtx(c)
	if err != nil {
		data, _ := c.GetRawData()
		log.L.Info().
			Str("body", string(data)).
			Msg("Malformed request")
		c.JSON(http.StatusNoContent, map[string]string{"message": "Malformed request"})
		return
	}

	req := &UpdatePersonRequest{}
	err = msg.ExtractDataInto(req)
	if err != nil {
		log.L.Info().
			Str("data", msg.Message.Data).
			Msg("Malformed request")
		c.JSON(http.StatusNoContent, map[string]string{"message": "Malformed request"})
		return
	}

	if req.PersonID == "" {
		log.L.Info().
			Str("person_id", req.PersonID).
			Msg("Unknown user")

		// This is used to ack a PubSub message, that's why the response has to be 2xx
		// Since we do not want this message replayed. We still provide a meningful response
		// if this is accessed in any other way.
		c.JSON(http.StatusNoContent, map[string]string{"message": "Unknown user"})
		return
	}

	person, err := s.members.GetMemberData(req.PersonID)
	if err != nil {
		log.L.Error().
			Err(err).
			Str("person_id", req.PersonID).
			Msg("Error when getting member data")
		c.JSON(500, map[string]string{"message": "Unable to get data"})
		return
	}

	err = firebase.UpdateOrCreateUser(c.Request.Context(), s.fs, person)
	if err != nil {
		log.L.Error().
			Err(err).
			Str("person_id", req.PersonID).
			Msg("Error when updating user")
		c.JSON(500, map[string]string{"message": "Unable to update user"})
		return
	}

	c.Status(http.StatusNoContent)
}
