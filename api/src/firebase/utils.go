package firebase

import (
	"context"

	"cloud.google.com/go/firestore"
	firebase "firebase.google.com/go"
	"go.bcc.media/bcco-api/log"
)

// MustSetupFirebase and return a valid client
func MustSetupFirebase(ctx context.Context, projectID string) (*firebase.App, *firestore.Client) {
	conf := &firebase.Config{ProjectID: projectID}
	app, err := firebase.NewApp(ctx, conf)
	if err != nil {
		log.L.Fatal().Err(err)
	}

	client, err := app.Firestore(ctx)
	if err != nil {
		log.L.Fatal().Err(err)
	}
	return app, client
}
