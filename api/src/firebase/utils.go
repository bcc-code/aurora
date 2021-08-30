package firebase

import (
	"context"

	"cloud.google.com/go/firestore"
	firebase "firebase.google.com/go"
	"go.bcc.media/bcco-api/log"
)

// MustSetupFirestore and return a valid client
func MustSetupFirestore(ctx context.Context, projectID string) *firestore.Client {
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
