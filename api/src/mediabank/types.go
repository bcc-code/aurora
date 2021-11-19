package mediabank

// EventData as recieved from Mediabank
type EventData struct {
	VidispineID string `json:"VS-ID"`
	Filename    string `json:"FILENAME"`
}
