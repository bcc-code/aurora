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
	"go.opencensus.io/plugin/ochttp"
	"go.opencensus.io/trace"
	"go.opencensus.io/trace/propagation"
)

func setupTracing() {
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

type Server struct {
	fs *firestore.Client
}

func NewServer(fs *firestore.Client) *Server {
	return &Server{
		fs: fs,
	}
}

func (s Server) Profile(c *gin.Context) {
	userID := c.Params.ByName("userID")
	if userID == "" {
		// TODO: Placeholder image
	}
}

func main() {
	log.ConfigureGlobalLogger(zerolog.DebugLevel)
	//ctx := context.Background()

	/*
		fbClient := mustSetupFirestore(ctx, "brunstadtv-online-dev") // TODO: Get from ENV

		x, err := fbClient.Collection("users").Doc("19254").Get(ctx)
		fmt.Printf("x: %v\n", x)
		fmt.Printf("err: %v\n", err)

		y := User{}
		err = x.DataTo(&y)
		fmt.Printf("err: %v\n", err)
		fmt.Printf("y: %+v\n", y)
	*/

	membersKey := os.Getenv("MEMBERS_API_KEY")
	membersClient := members.NewClient("members.bcc.no", membersKey, log.L)
	member, err := membersClient.GetMemberData("19254")
	log.L.Debug().Msgf("Member: %+v", member)
	log.L.Debug().Err(err).Msg("Error")

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

	router.POST("pubsub-push", dummy)
	router.Run("0.0.0.0:8000")
}

func dummy(c *gin.Context) {
	log.L.Debug().Msgf("Got: %+v", c.Request.Body)
	c.JSON(http.StatusOK, []string{})
}
