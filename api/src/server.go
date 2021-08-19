package main

import (
	"encoding/base64"
	"encoding/json"
	"net/http"
	"time"

	"cloud.google.com/go/firestore"
	"github.com/gin-gonic/gin"
	"go.bcc.media/bcco-api/firebase"
	"go.bcc.media/bcco-api/log"
	"go.bcc.media/bcco-api/members"
)

/*
Example pubsub body:

{
    "message": {
        "attributes": {
            "key": "value"
        },
        "data": "SGVsbG8gQ2xvdWQgUHViL1N1YiEgSGVyZSBpcyBteSBtZXNzYWdlIQ==",
        "messageId": "2070443601311540",
        "message_id": "2070443601311540",
        "publishTime": "2021-02-26T19:13:55.749Z",
        "publish_time": "2021-02-26T19:13:55.749Z",
    },
   "subscription": "projects/myproject/subscriptions/mysubscription"
}
*/

// MessageFromCtx that was send to the server from PubSub
func MessageFromCtx(ctx *gin.Context) (*PubSubMessage, error) {
	msg := &PubSubMessage{}
	err := ctx.BindJSON(msg)
	if err != nil {
		return nil, err
	}

	return msg, nil
}

// PubSubMessage represents the body of the message we get from PubSub
type PubSubMessage struct {
	Message      Message `json:"message"`
	Subscription string  `json:"subscription"`
}

// Message is the message encoded in the PubSub data
type Message struct {
	Attributes  map[string]string `json:"attributes"`
	Data        string            `json:"data"`
	MessageID   string            `json:"messageId"`
	PublishTime time.Time         `json:"publishTime"`
}

// ExtractDataInto and attempt to put it into the provided object
func (m *PubSubMessage) ExtractDataInto(out interface{}) error {
	decoded, err := base64.RawStdEncoding.DecodeString(m.Message.Data)
	if err != nil {
		return err
	}

	return json.Unmarshal(decoded, out)
}

// Server holds shared resources for the webserver
// so they can be accessed by all requests
type Server struct {
	fs      *firestore.Client
	members *members.Client
}

// NewServer with embedded shared resources
func NewServer(fs *firestore.Client, membersClient *members.Client) *Server {
	return &Server{
		fs:      fs,
		members: membersClient,
	}
}

func (Server) dummy(c *gin.Context) {
	log.L.Debug().Msgf("Got: %+v", c.Request.Body)
	c.JSON(http.StatusOK, []string{})
}

// UpdatePersonRequest for parsing the PubSub message
type UpdatePersonRequest struct {
	PersonID string `json:"person_id"`
}

// UpdatePersonFromMembers handles the pubsub notification
// StatusNoContent is used to ACK messages that we do not want retried even if the
// actual staus is a permanent error
func (s Server) UpdatePersonFromMembers(c *gin.Context) {
	msg, err := MessageFromCtx(c)
	if err != nil {
		data,_ := c.GetRawData()
		log.L.Info().
			Str("body",string(data)).
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

	err = firebase.UpdateUser(c.Request.Context(), s.fs, person)
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
