package main

import (
	"net/http"

	"cloud.google.com/go/firestore"
	mbBridge "github.com/bcc-code/mediabank-bridge/proto"
	"github.com/gin-gonic/gin"
	"go.bcc.media/bcco-api/analytics"
	"go.bcc.media/bcco-api/firebase"
	"go.bcc.media/bcco-api/log"
	"go.bcc.media/bcco-api/members"
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

	MediaBankBridgeClient mbBridge.MediabankBridgeClient
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

	mediaBankBridgeClient mbBridge.MediabankBridgeClient
}

// NewServer with embedded shared resources
func NewServer(c ServerConfig) *Server {
	return &Server{
		fs:                    c.FirestoreClient,
		members:               c.MembersClient,
		membersWebhookSecret:  c.MembersWebhookSecret,
		analyticsClient:       c.AnalyticsClient,
		httpClient:            c.HTTPClient,
		collectionBaseURL:     c.CollectionBaseURL,
		collectionAPIKey:      c.CollectionAPIKey,
		analyticsIDSecret:     c.AnalitycsIDSecret,
		mediaBankBridgeClient: c.MediaBankBridgeClient,
	}
}

// UpdatePersonRequest for parsing the PubSub message
type UpdatePersonRequest struct {
	PersonID string `json:"person_id"`
}

// UpdatePersonFromMembers fetches data from members API and updates the member.
// No auth so should currently only be used locally for testing and debugging purposes
func (s Server) UpdatePersonFromMembers(c *gin.Context) {
	req := &UpdatePersonRequest{}
	err := c.BindJSON(req)
	if err != nil {
		log.L.Info().
			Err(err).
			Msg("Malformed request")
		c.JSON(http.StatusBadRequest, map[string]string{"message": "Malformed request"})
		return
	}

	if req.PersonID == "" {
		log.L.Info().
			Str("person_id", req.PersonID).
			Msg("Unknown user")

		// This is used to ack a PubSub message, that's why the response has to be 2xx
		// Since we do not want this message replayed. We still provide a meningful response
		// if this is accessed in any other way.
		c.JSON(http.StatusNotFound, map[string]string{"message": "Unknown user"})
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

	go s.analyticsClient.Identify(float64(person.PersonID))

	ch := firebase.Church{}
	ch = ch.UpdateFromMembers(&person.Church.Org)
	err = ch.Upsert(c.Request.Context(), s.fs)
	if err != nil {
		log.L.Warn().
			Err(err).
			Str("churchId", person.Church.ID).
			Msg("Error when updating church")
	}

	c.Status(http.StatusNoContent)
}
