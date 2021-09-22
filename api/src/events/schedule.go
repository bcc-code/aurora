package events

import "time"

// ScheduleEndData for transmission via Cloud Tasks
type ScheduleEndData struct {
	EventID string
	Time    time.Time
}
