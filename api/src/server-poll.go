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
