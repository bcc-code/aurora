package firebase

import "cloud.google.com/go/firestore"

// BTVAppConfig is the data structure read by the BTV app
type BTVAppConfig struct {
	// "currentCompetition": null, Currently not in use
	CanCheckin             bool                   `firestore:"canCheckin"`
	CurrentEventGroup      *firestore.DocumentRef `firestore:"currentEventGroup"`
	CurrentEventPath       *firestore.DocumentRef `firestore:"currentEventPath"`
	EventPagePath          *firestore.DocumentRef `firestore:"eventPagePath"`
	IsLiveOnline           bool                   `firestore:"isLiveOnline"`
	MinAppVersion          string                 `firestore:"minAppVersion"`
	ShowMaintenanceMessage bool                   `firestore:"showMaintenanceMessage"`
}
