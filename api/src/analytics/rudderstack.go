package analytics

import (
	"fmt"
	"time"

	rs "github.com/rudderlabs/analytics-go"
	"go.bcc.media/bcco-api/log"
)

// Client for the analytics platform
type Client struct {
	rsURL        string
	rsKey        string
	rsClient     rs.Client
	sharedSecret string

	applicationVersion string
	applicationBuild   string
}

// MustSetupAnalytics creates a wrapped rudderstack client
func MustSetupAnalytics(url, rudderstackKey, sharedSecret, appVersion, appBuild string) *Client {
	c := &Client{
		rsURL:              url,
		rsKey:              rudderstackKey,
		sharedSecret:       sharedSecret,
		applicationVersion: appVersion,
		applicationBuild:   appBuild,
	}

	c.init()
	return c
}

func (c *Client) init() {
	client, _ := rs.NewWithConfig(c.rsKey, c.rsURL,
		rs.Config{
			Interval:  1 * time.Second,
			BatchSize: 100,
			Verbose:   true,
		})
	c.rsClient = client
}

// GetID for analytics use based on the personID
func (c Client) GetID(personID float64) string {
	return GenerateID(personID, c.sharedSecret)
}

// Close the underlying Analytics client
func (c Client) Close() {
	err := c.rsClient.Close()
	if err != nil {
		log.L.Warn().Err(err).Stack().Msg("Error closing RS Client")
	}
}

// Identify updates users data in RS
func (c Client) Identify(personID float64) {
	if c.rsClient == nil {
		log.L.Warn().Stack().Msg("Analytics is not set up yet")
		return
	}

	t := rs.NewTraits()
	t.Set("personId", fmt.Sprintf("%.0f", personID))
	anonID := c.GetID(personID)

	c.rsClient.Enqueue(rs.Identify{
		AnonymousId: anonID,
		UserId:      anonID,
		Traits:      t,
		Context: &rs.Context{
			App: rs.AppInfo{
				Name: "Aurora Backend",
			},
		},
	})
}

// Track an event, automatically adding context
func (c Client) Track(
	id string,
	event string,
	properties rs.Properties,
) {
	if c.rsClient == nil {
		log.L.Warn().Stack().Msg("Analytics is not set up yet")
		return
	}

	t := rs.Track{
		Properties: properties,
		Context: &rs.Context{
			App: rs.AppInfo{
				Build:     c.applicationBuild,
				Version:   c.applicationVersion,
				Namespace: "BCCO-V2",
				Name:      "BCCO API v2",
			},
		},
	}

	c.rsClient.Enqueue(t)
}
