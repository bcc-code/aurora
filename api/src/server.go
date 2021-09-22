package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"go.bcc.media/bcco-api/events"
	"go.bcc.media/bcco-api/firebase"
	"go.bcc.media/bcco-api/log"
	"go.bcc.media/bcco-api/members"
	"go.bcc.media/bcco-api/pubsub"

	cloudtasks "cloud.google.com/go/cloudtasks/apiv2"
	"cloud.google.com/go/firestore"
	"google.golang.org/genproto/googleapis/cloud/tasks/v2"
	"google.golang.org/protobuf/types/known/timestamppb"

	"github.com/gin-gonic/gin"
)

// Server holds shared resources for the webserver
// so they can be accessed by all requests
type Server struct {
	fs               *firestore.Client
	cloudTasksClient *cloudtasks.Client

	membersWebhookSecret string
	cloudQueuePath       string
	baseURL              string
}

// NewServer with embedded shared resources
func NewServer(
	membersWebhookSecret string,
	fs *firestore.Client,
	cloudTasksClient *cloudtasks.Client,
	cloudQueuePath string,
	baseURL string,
) *Server {
	return &Server{
		fs:                   fs,
		membersWebhookSecret: membersWebhookSecret,
		cloudTasksClient:     cloudTasksClient,
		cloudQueuePath:       cloudQueuePath,
		baseURL:              baseURL,
	}
}

// MembersWebhook accepts push notifications from Members system
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

	for i, person := range updatedMemebers {
		err = firebase.UpdateOrCreateUser(c.Request.Context(), s.fs, &person)
		if err == nil {
			log.L.Debug().
				Int("person_id", person.PersonID).
				Msg("Updated person")
			continue
		}

		log.L.Error().
			Err(err).
			Int("person_id", person.PersonID).
			Int("i", i).
			Msg("Error when updating user")

		// We just log the errors, for now as it it unlikely that we will be able to do
		// better in a retry
	}

	// We have to return a 2xx code regardless of the actual success as we don't want to get the message again
	c.Status(http.StatusNoContent)
}

// SchduledTask is a supertype for all scheduled types
type SchduledTask struct {
	ScheduledEnd *events.ScheduleEndData
}

type SavedTaskData struct {
	FullName      string
	Name          string
	CreatedTime   time.Time
	ScheduledTime time.Time
	Completed     bool
}

// AdminTasksWebhook handles the webhook requests from Google Cloud Tasks
func (s Server) AdminTasksWebhook(c *gin.Context) {
	ctx := c.Request.Context()
	inputData := &SchduledTask{}
	err := c.BindJSON(inputData)
	if err != nil {
		c.AbortWithError(http.StatusBadRequest, err)
		log.L.Error().
			Err(err).
			Msg("Can't parse inputData")
		return
	}

	taskName := c.Request.Header.Get("x-cloudtasks-taskname")
	docRef := s.fs.Doc(fmt.Sprintf("scheduled/%s", taskName))
	doc, err := docRef.Get(ctx)
	if err != nil {
		c.AbortWithError(http.StatusNotFound, err)
		log.L.Error().
			Err(err).
			Msg("Can't get task data")
		return
	}

	savedTaskData := &SavedTaskData{}
	doc.DataTo(savedTaskData)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		log.L.Error().
			Err(err).
			Msg("Can't get parse data")
		return
	}

	if savedTaskData.Completed {
		c.AbortWithStatus(http.StatusConflict)
		return
	}

	if inputData.ScheduledEnd != nil {
		// TODO: Process
		err = events.EndEvent(ctx, s.fs, inputData.ScheduledEnd.EventID)
	} else {
		c.AbortWithStatus(http.StatusNotImplemented)
		return
	}

	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		log.L.Error().
			Err(err).
			Str("Task name", taskName).
			Msg("Error executing delayed command")
		return
	}

	docRef.Update(ctx, []firestore.Update{
		{Path: "completed", Value: true},
	})

	c.JSON(200, gin.H{"a": "b"})
}

// ScheduleEnd of the specified event.
// This will be scheduled in Google Cloud Tasks in the form of a delayed HTTP call
func (s Server) ScheduleEnd(c *gin.Context) {
	ctx := c.Request.Context()

	inputData := &events.ScheduleEndData{}
	err := c.BindJSON(inputData)
	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		log.L.Error().
			Err(err).
			Msg("Can't parse inputData")
		return
	}

	t := SchduledTask{ScheduledEnd: inputData}
	body, err := json.Marshal(t)

	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		log.L.Error().
			Err(err).
			Msg("Can't marshall SchduledTask")
		return
	}

	task, err := s.cloudTasksClient.CreateTask(
		ctx,
		&tasks.CreateTaskRequest{
			Parent: s.cloudQueuePath,
			Task: &tasks.Task{
				ScheduleTime: timestamppb.New(time.Now().Add(1 * time.Minute)), // TOODO
				MessageType: &tasks.Task_HttpRequest{
					HttpRequest: &tasks.HttpRequest{
						HttpMethod: tasks.HttpMethod_POST,
						Url:        "https://webhook.site/db1731b7-b030-4b94-b198-924b4200b6c7", // TODO
						Body:       body,
					},
				},
			},
		},
	)

	// task.Name == "projects/brunstadtv-online-dev/locations/europe-west1/queues/test1/tasks/98806264114180590521"
	// we need to extract the last element for use un FB
	taskName := strings.Split(task.Name, "/")[7]

	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		log.L.Error().
			Err(err).
			Msg("Can't schedule task")
		return
	}

	doc := s.fs.Doc(fmt.Sprintf("scheduled/%s", taskName))

	_, err = doc.Create(ctx, SavedTaskData{
		FullName:      task.Name,
		Name:          taskName,
		CreatedTime:   task.CreateTime.AsTime(),
		ScheduledTime: task.ScheduleTime.AsTime(),
		Completed:     false,
	})

	if err != nil {
		c.AbortWithError(http.StatusInternalServerError, err)
		log.L.Error().
			Err(err).
			Msg("Can't save schedule")
		return
	}

	c.JSON(
		http.StatusOK,
		task,
	)
}
