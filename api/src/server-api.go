package main

import (
	"fmt"
	"io/ioutil"
	"net/http"
	"net/url"
	"strconv"

	"github.com/gin-gonic/gin"
	"go.bcc.media/bcco-api/analytics"
	"go.bcc.media/bcco-api/log"
)

// Header constants
const (
	HeaderXPersonID = "x-person-id"
)

// GenerateAnalyticsID for the user requesting
func (s Server) GenerateAnalyticsID(c *gin.Context) {
	var personID float64

	if pid, ok := c.Get("PersonID"); ok {
		personID = pid.(float64)
	} else if pidHeader := c.GetHeader(HeaderXPersonID); pidHeader != "" {
		pidFloat, err := strconv.ParseFloat(pidHeader, 64)
		if err != nil {
			log.L.Debug().Str(HeaderXPersonID, pidHeader).
				Msg("Could not parse x-person-id")
			c.AbortWithStatus(http.StatusBadRequest)
			return
		}
		personID = pidFloat
	} else {
		c.AbortWithStatus(http.StatusUnauthorized)
		return
	}

	id := analytics.GenerateID(personID, s.analyticsIDSecret)

	c.JSON(http.StatusOK, gin.H{"id": string(id)})
}

// GetCollectionResults from the collection api.
// This is just a simple proxy to do M2M authentication
func (s Server) GetCollectionResults(c *gin.Context) {
	url := fmt.Sprintf("%s/Collection/status?apiKey=%s", s.collectionBaseURL, url.QueryEscape(s.collectionAPIKey))

	res, err := s.httpClient.Get(url)
	if err != nil {
		log.L.Error().Err(err).Msg("Error fetching collection data")
		c.AbortWithStatus(http.StatusGatewayTimeout)
		return
	}
	defer res.Body.Close()

	bodyBytes := []byte{}
	if res.StatusCode == http.StatusOK {
		bodyBytes, err = ioutil.ReadAll(res.Body)
		if err != nil {
			log.L.Error().Err(err).Msg("Error reading body")
			c.AbortWithStatus(http.StatusGatewayTimeout)
			return
		}
	}

	c.Data(http.StatusOK, "application/json; charset=utf-8", bodyBytes)
}
