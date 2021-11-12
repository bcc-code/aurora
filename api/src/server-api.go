package main

import (
	"encoding/json"
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

type CollectionResult struct {
	Values      []CollectionResultValue `json:"value"`
	Failed      bool                    `json:"failed"`
	HasWarnings bool                    `json:"hasWarnings"`
	Success     bool                    `json:"success"`
}
type CollectionResultValue struct {
	ActivityID  int     `json:"activityId"`
	Timestamp   string  `json:"timestamp"`
	ChurchID    int     `json:"churchId"`
	Amount      float64 `json:"amount"`
	PersonID    int     `json:"personId"`
	OrderNumber string  `json:"orderNumber"`
	SpouseID    int     `json:"spouseId"`
}

// GetCollectionResults from the collection api.
// This is just a simple proxy to do M2M authentication
func (s Server) GetCollectionResults(c *gin.Context) {
	url := fmt.Sprintf("%s/Collection/v2/status/string?apiKey=%s", s.collectionBaseURL, url.QueryEscape(s.collectionAPIKey))
	log.L.Debug().Str("URL", url).Msg("URL is")
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
	} else {
		log.L.Error().Int("Status Code", res.StatusCode).Msg("Request failed")
	}

	collectionResult := &CollectionResult{}
	err = json.Unmarshal(bodyBytes, collectionResult)
	if err != nil {
		log.L.Error().Err(err).Msg("Error parsing body")
		c.AbortWithStatus(http.StatusBadGateway)
		return
	}

	total := 0.0
	for _, val := range collectionResult.Values {
		total += val.Amount
	}

	c.JSON(http.StatusOK, gin.H{
		"total": total,
	})
}
