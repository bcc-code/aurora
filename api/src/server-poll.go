package main

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"go.bcc.media/bcco-api/firebase"
	"go.bcc.media/bcco-api/log"
)

type eventIDQuery struct {
	EventID string
}

// UpdatePollStatsByAge regenerates stats based on the specified event
func (s Server) UpdatePollStatsByAge(c *gin.Context) {
	q := eventIDQuery{}
	err := c.ShouldBindQuery(&q)

	if err != nil {
		log.L.Error().
			Err(err).
			Msg("Error binding")
		c.AbortWithStatus(http.StatusBadRequest)
		return
	}

	cutoff := 18

	ctx := c.Request.Context()
	under, over, err := firebase.GetAgePercentages(ctx, s.fs, q.EventID, cutoff)

	if err != nil {
		log.L.Error().
			Err(err).
			Str("EventId", q.EventID).
			Msg("Error calculating percentages")
		c.AbortWithStatus(http.StatusInternalServerError)
		return
	}

	err = firebase.WritePollAgeStats(ctx, s.fs, q.EventID, cutoff, over, under)
	if err != nil {
		fmt.Printf("%+v", err)
		log.L.Error().
			Err(err).
			Str("EventId", q.EventID).
			Msg("Error saving data")
		c.AbortWithStatus(http.StatusInternalServerError)
	}
	c.AbortWithStatus(http.StatusNoContent)
}

// UpdatePollStatsByChurch regenerates stats based on the church
func (s Server) UpdatePollStatsByChurch(c *gin.Context) {
	q := eventIDQuery{}
	err := c.ShouldBindQuery(&q)

	if err != nil {
		log.L.Error().
			Err(err).
			Msg("Error binding")
		c.AbortWithStatus(http.StatusBadRequest)
		return
	}

	ctx := c.Request.Context()
	stats, err := firebase.GetPollChurchPercentages(ctx, s.fs, q.EventID)

	if err != nil {
		log.L.Error().
			Err(err).
			Str("EventId", q.EventID).
			Msg("Error calculating percentages")
		c.AbortWithStatus(http.StatusInternalServerError)
		return
	}

	top10 := 10
	err = firebase.WritePollChurchesStats(ctx, s.fs, q.EventID, top10, stats)
	if err != nil {
		fmt.Printf("%+v", err)
		log.L.Error().
			Err(err).
			Str("EventId", q.EventID).
			Msg("Error saving data")
		c.AbortWithStatus(http.StatusInternalServerError)
	}
	c.AbortWithStatus(http.StatusNoContent)
}
