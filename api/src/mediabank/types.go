package mediabank

import (
	"time"
)

// EventData as recieved from Mediabank
type EventData struct {
	VidispineID  string `json:"VS-ID"`
	Filename     string `json:"FILENAME"`
	StartTimeISO string `json:"STARTTIME"`
	Fps          string `json:"FPS"`
	StartTime    time.Time
}
