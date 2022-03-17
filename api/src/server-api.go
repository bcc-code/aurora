package main

import (
	"fmt"
	"io/ioutil"
	"net/http"
	"net/url"
	"strconv"

	"github.com/bcc-code/mediabank-bridge/proto"
	"github.com/gin-gonic/gin"
	"go.opencensus.io/trace"

	"go.bcc.media/bcco-api/analytics"
	"go.bcc.media/bcco-api/log"
)

// Header constants
const (
	HeaderXPersonID = "x-person-id"
)

// GenerateAnalyticsID for the user requesting
func (s Server) GenerateAnalyticsID(c *gin.Context) {
	_, t := trace.StartSpan(c.Request.Context(), "GenerateAnalyticsID")
	defer t.End()

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
	_, t := trace.StartSpan(c.Request.Context(), "GetCollectionResults")
	defer t.End()

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
	} else {
		bodyBytes, _ = ioutil.ReadAll(res.Body)
		log.L.Error().Int("Status", res.StatusCode).Str("body", string(bodyBytes)).Msg("Bad status")
	}

	c.Data(http.StatusOK, "application/json; charset=utf-8", bodyBytes)
}

// CreateSubclip in mediabanken
func (s Server) CreateSubclip(c *gin.Context) {
	ctx, t := trace.StartSpan(c.Request.Context(), "CreateSubclip")
	defer t.End()

	req := &proto.CreateSubclipRequest{}
	err := c.BindJSON(req)
	if err != nil {
		log.L.Error().Err(err).Msg("CreateSubclip")
		c.AbortWithStatus(http.StatusInternalServerError)
		return
	}

	res, err := s.mediaBankBridgeClient.CreateSubclip(ctx, req)
	if err != nil {
		log.L.Error().Err(err).Msg("CreateSubclip")
		c.AbortWithStatus(http.StatusInternalServerError)
		return
	}

	log.L.Debug().Str("Message", res.Message).Msg("Response from MB bridge")
	c.AbortWithStatus(http.StatusNoContent)
}
