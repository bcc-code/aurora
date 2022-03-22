package main

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"go.bcc.media/bcco-api/firebase"
	"go.bcc.media/bcco-api/log"
	"go.opencensus.io/trace"
)

type eventIDQuery struct {
	EventID string
}

// UpdatePollStatsByAge regenerates stats based on the specified event
func (s Server) UpdatePollStatsByAge(c *gin.Context) {
	ctx, t := trace.StartSpan(c.Request.Context(), "UpdatePollStatsByAge")
	defer t.End()

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
	ctx, t := trace.StartSpan(c.Request.Context(), "UpdatePollStatsByChurch")
	defer t.End()

	q := eventIDQuery{}
	err := c.ShouldBindQuery(&q)

	if err != nil {
		log.L.Error().
			Err(err).
			Msg("Error binding")
		c.AbortWithStatus(http.StatusBadRequest)
		return
	}

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
	minAnswers := 15

	err = firebase.WritePollChurchesStats(ctx, s.fs, q.EventID, top10, minAnswers, stats)
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
