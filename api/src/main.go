package main

import (
	"context"
	"net/http"
	"os"
	"strings"

	"github.com/gin-contrib/cors"
	"github.com/gin-contrib/logger"
	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog"

	"go.bcc.media/bcco-api/analytics"
	"go.bcc.media/bcco-api/auth0"
	"go.bcc.media/bcco-api/firebase"
	"go.bcc.media/bcco-api/log"
	"go.bcc.media/bcco-api/members"

	"contrib.go.opencensus.io/exporter/stackdriver"
	"contrib.go.opencensus.io/exporter/stackdriver/propagation"
	"go.opencensus.io/plugin/ochttp"
	"go.opencensus.io/trace"
)

// Header keys
const (
	HeaderXApiKey   = "x-api-key"
	HeaderXApiToken = "x-api-token"
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

	analyticsAPIKey := os.Getenv("ANALYTICS_API_KEY")
	if analyticsAPIKey == "" {
		// If this is empty the `/analytics/*` endpoints are public. Not ideal
		log.L.Panic().Msg("ANALYTICS_API_KEY is empty")
		return
	}

	analyticsSecret := os.Getenv("ANALYTICS_SECRET")
	if analyticsSecret == "" {
		// It would be bad to use "" as a shared secret
		log.L.Panic().Msg("ANALYTICS_SECRET is empty")
		return
	}

	auth0Domain := os.Getenv("AUTH0_DOMAIN")
	auth0Issuer := os.Getenv("AUTH0_ISSUER")

	auth0AudiencesRaw := os.Getenv("AUTH0_AUDIENCES")
	// Audience can be a comma separated string
	auth0Audiences := strings.Split(auth0AudiencesRaw, ",")

	collectionBaseURL := os.Getenv("COLLECTION_URL")
	collectionAPIKey := os.Getenv("COLLECTION_API_KEY")

	// We currently only support running in the same project as firebase
	firebaseProject := os.Getenv("GOOGLE_CLOUD_PROJECT")

	rudderstackKey := os.Getenv("RUDDERSTACK_KEY")
	rudderstackURL := os.Getenv("RUDDERSTACK_URL")

	// A bit of misuse but K_REVISION is set by GCR and gives a lot of info
	appBuild := os.Getenv("K_REVISION")
	if appBuild == "" {
		appBuild = "DeveloperLocal"
	}

	// Instantiates a client to use send messages to the Rudder API.
	analyticsClient := analytics.MustSetupAnalytics(rudderstackURL, rudderstackKey, analyticsSecret, "", appBuild)

	go auth0.GetKeySet(auth0Domain)

	log.L.Debug().Msg("Connectiong to firebase")
	fbApp, fsClient := firebase.MustSetupFirebase(ctx, firebaseProject)

	log.L.Debug().Msg("Creating members client")
	membersClient := members.NewClient(tracedHTTPClient, membersDomain, membersKey, log.L)

	log.L.Debug().Msg("Creating server")
	server := NewServer(ServerConfig{
		MembersWebhookSecret: membersWebhookSecret,
		FirestoreClient:      fsClient,
		MembersClient:        membersClient,
		HTTPClient:           tracedHTTPClient,
		CollectionAPIKey:     collectionAPIKey,
		CollectionBaseURL:    collectionBaseURL,
		AnalyticsClient:      analyticsClient,
		AnalitycsIDSecret:    analyticsSecret,
	})

	router := gin.Default()
	router.Use(logger.SetLogger(logger.Config{
		Logger: log.L,
	}))

	router.Use(cors.New(cors.Config{
		AllowOrigins:  []string{"*"},
		AllowMethods:  []string{"GET", "POST"},
		AllowHeaders:  []string{"Origin", "audience", "authorization", HeaderXApiKey, HeaderXApiToken, HeaderXPersonID},
		ExposeHeaders: []string{"Content-Length"},
	}))

	// /admin/ path only admits users who have an admin role.
	// There is currently no need for more complex access controll so we
	// just mirror what FB api is doing
	admin := router.Group("admin")
	admin.Use(auth0.JWTCheck(ctx, auth0.JWTConfig{
		Domain:    auth0Domain,
		Issuer:    auth0Issuer,
		Audiences: auth0Audiences,
	}, fbApp))
	admin.Use(firebase.ValidateRole(fsClient, firebase.Roles(firebase.Admin)))

	// /api/ only validates that a valid token exists but nothing else (accessible for all users)
	apiGrp := router.Group("api")
	apiGrp.Use(auth0.JWTCheck(
		ctx,
		auth0.JWTConfig{
			Domain:    auth0Domain,
			Issuer:    auth0Issuer,
			Audiences: auth0Audiences,
		},
		fbApp,
	))
	apiGrp.GET("analyticsid", server.GenerateAnalyticsID)
	apiGrp.GET("donationstatus", server.GetCollectionResults)

	// /analytics/ is protected by a (set) of API keys. It is meant to be used by the
	// transformers in rudderstack
	analyticsGrp := router.Group("analytics")
	analyticsGrp.Use(APIKeyMiddleware([]string{analyticsAPIKey}, HeaderXApiKey))
	analyticsGrp.GET("enrichment", server.GetEnrichmentData)

	// Webhooks have no direct authentication but use a HMAC to prove the origin
	webhooks := router.Group("webhooks")
	webhooks.POST("members", server.MembersWebhook)

	initTrace.End()

	log.L.Info().Msg("About to listen to :8000")
	router.Run("0.0.0.0:8000")
	log.L.Info().Msg("Server shutting down")
}
