package events

import (
	"context"

	"cloud.google.com/go/firestore"
)

// EndEvent that is currently running
func EndEvent(ctx context.Context, fs *firestore.Client, eventID string) error {
	bcco := fs.Doc("configs/bcc-online")
	_, err := bcco.Update(ctx, []firestore.Update{
		{Path: "currentEventPath", Value: nil},
	})
	if err != nil {
		return err
	}

	btv := fs.Doc("configs/brunstadtv-app")
	_, err = btv.Update(ctx, []firestore.Update{
		{Path: "currentEventPath", Value: nil},
	})

	return err
}
