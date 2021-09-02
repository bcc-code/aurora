package main

import (
	"context"
	"net/http"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-contrib/logger"
	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog"

	"go.bcc.media/bcco-api/auth0"
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
	ctx := context.Background()
	log.ConfigureGlobalLogger(zerolog.DebugLevel)
	log.L.Debug().Msg("Seting up tracing")
	tracedHTTPClient := mustSetupTracing()

	ctx, initTrace := trace.StartSpan(ctx, "init")

	log.L.Debug().Msg("Fetching ENV vars")
	membersKey := os.Getenv("MEMBERS_API_KEY")
	membersWebhookSecret := os.Getenv("MEMBERS_WEBHOOKS_SECRET")
	membersDomain := os.Getenv("MEMBERS_DOMAIN")

	auth0Domain := os.Getenv("AUTH0_DOMAIN")
	auth0Issuer := os.Getenv("AUTH0_ISSUER")
	auth0Audience := os.Getenv("AUTH0_AUDIENCE")

	// We currently only support running in the same project as firebase
	firebaseProject := os.Getenv("GOOGLE_CLOUD_PROJECT")

	go auth0.GetKeySet(auth0Domain)

	log.L.Debug().Msg("Connectiong to firebase")
	fbClient := firebase.MustSetupFirestore(ctx, firebaseProject) // TODO: Get from ENV

	log.L.Debug().Msg("Creating members client")
	membersClient := members.NewClient(tracedHTTPClient, membersDomain, membersKey, log.L)

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

	// /admin/ path only admits users who have an admin role.
	// There is currently no need for more complex access controll so we
	// just mirror what FB api is doing
	admin := router.Group("admin")
	admin.Use(auth0.JWTCheck(auth0.JWTConfig{
		Domain:   auth0Domain,
		Issuer:   auth0Issuer,
		Audience: auth0Audience,
	}))
	admin.Use(firebase.ValidateRole(fbClient, firebase.Roles(firebase.Admin)))

	// Webhooks have no direct authentication but use a HMAC to prove the origin
	webhooks := router.Group("webhooks")
	webhooks.POST("members", server.MembersWebhook)
	webhooks.POST("update-person", server.UpdatePersonFromMembers)

	initTrace.End()

	log.L.Info().Msg("About to listen to :8000")
	router.Run("0.0.0.0:8000")
	log.L.Info().Msg("Server shutting down")
}
