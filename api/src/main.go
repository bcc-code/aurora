package main

import (
	"context"
	"net/http"
	"os"

	"cloud.google.com/go/firestore"
	firebase "firebase.google.com/go"
	"github.com/gin-contrib/cors"
	"github.com/gin-contrib/logger"
	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog"

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

func mustSetupFirestore(ctx context.Context, projectID string) *firestore.Client {
	conf := &firebase.Config{ProjectID: projectID}
	app, err := firebase.NewApp(ctx, conf)
	if err != nil {
		log.L.Fatal().Err(err)
	}

	client, err := app.Firestore(ctx)
	if err != nil {
		log.L.Fatal().Err(err)
	}
	return client
}

// User represents a user in the system as represented in the firebase
type User struct {
	Birthdate     string
	ChurchName    string
	CountryName   string
	DisplayName   string
	FirstName     string
	Guardian1Id   int
	Guardian2Id   int
	LastName      string
	LastUpdated   string
	LinkedUserIds []int
	PersonId      int
	Uid           string
}

func main() {
	log.ConfigureGlobalLogger(zerolog.DebugLevel)
	log.L.Debug().Msg("Seting up tracing")
	tracedHTTPClient := mustSetupTracing()

	log.L.Debug().Msg("Fetching ENV vars")
	membersKey := os.Getenv("MEMBERS_API_KEY")

	ctx := context.Background()
	log.L.Debug().Msg("Connectiong to firebase")
	fbClient := mustSetupFirestore(ctx, "brunstadtv-online-dev") // TODO: Get from ENV

	/*
		x, err := fbClient.Collection("users").Doc("19254").Get(ctx)
		fmt.Printf("x: %v\n", x)
		fmt.Printf("err: %v\n", err)

		y := User{}
		err = x.DataTo(&y)
		fmt.Printf("err: %v\n", err)
		fmt.Printf("y: %+v\n", y)
	*/
	log.L.Debug().Msg("Creating members client")
	membersClient := members.NewClient(tracedHTTPClient, "members.bcc.no", membersKey, log.L)

	log.L.Debug().Msg("Creating server")
	server := NewServer(fbClient, membersClient)

	router := gin.Default()
	router.Use(logger.SetLogger(logger.Config{
		Logger: log.L,
	}))

	router.Use(cors.New(cors.Config{
		AllowOrigins:  []string{"*"},
		AllowMethods:  []string{"GET"},
		AllowHeaders:  []string{"Origin"},
		ExposeHeaders: []string{"Content-Length"},
	}))

	router.POST("pubsub-push", server.dummy)
	log.L.Info().Msg("About to listen to :8000")
	router.Run("0.0.0.0:8000")
	log.L.Info().Msg("Server shutting down")
}
