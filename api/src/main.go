package main

import (
	"context"
	"net/http"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-contrib/logger"
	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog"

	"go.bcc.media/bcco-api/firebase"
	"go.bcc.media/bcco-api/log"
	"go.bcc.media/bcco-api/members"

	"contrib.go.opencensus.io/exporter/stackdriver"
	"contrib.go.opencensus.io/exporter/stackdriver/propagation"
	"go.opencensus.io/plugin/ochttp"
	"go.opencensus.io/trace"
)

func mustSetupTracing() *http.Client {
	exporter, err := stackdriver.NewExporter(stackdriver.Options{
		ProjectID: os.Getenv("GOOGLE_CLOUD_PROJECT"),
	})

	if err != nil {
		log.L.Fatal().Err(err)
		panic(err)
	}

	trace.RegisterExporter(exporter)
	trace.ApplyConfig(trace.Config{DefaultSampler: trace.AlwaysSample()})

	client := &http.Client{
		Transport: &ochttp.Transport{
			// Use Google Cloud propagation format.
			Propagation: &propagation.HTTPFormat{},
		},
	}

	return client
}

func main() {
	log.ConfigureGlobalLogger(zerolog.DebugLevel)
	log.L.Debug().Msg("Seting up tracing")
	tracedHTTPClient := mustSetupTracing()

	log.L.Debug().Msg("Fetching ENV vars")
	membersKey := os.Getenv("MEMBERS_API_KEY")
	membersWebhookSecret := os.Getenv("MEMBERS_WEBHOOKS_SECRET")

	// We currently only support running in the same project as firebase
	firebaseProject := os.Getenv("GOOGLE_CLOUD_PROJECT")

	ctx := context.Background()
	log.L.Debug().Msg("Connectiong to firebase")
	fbClient := firebase.MustSetupFirestore(ctx, firebaseProject) // TODO: Get from ENV

	log.L.Debug().Msg("Creating members client")
	membersClient := members.NewClient(tracedHTTPClient, "members.bcc.no", membersKey, log.L)

	log.L.Debug().Msg("Creating server")
	server := NewServer(membersWebhookSecret, fbClient, membersClient)

	router := gin.Default()
	router.Use(logger.SetLogger(logger.Config{
		Logger: log.L,
	}))

	router.Use(cors.New(cors.Config{
		AllowOrigins:  []string{"*"},
		AllowMethods:  []string{"GET", "POST"},
		AllowHeaders:  []string{"Origin"},
		ExposeHeaders: []string{"Content-Length"},
	}))

	webhooks := router.Group("webhooks")
	webhooks.POST("members", server.MembersWebhook)
	webhooks.POST("update-person", server.UpdatePersonFromMembers)

	log.L.Info().Msg("About to listen to :8000")
	router.Run("0.0.0.0:8000")
	log.L.Info().Msg("Server shutting down")
}
