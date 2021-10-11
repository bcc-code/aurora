package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"go.bcc.media/bcco-api/analytics"
	"go.bcc.media/bcco-api/log"
)

// APIKeyMiddleware only allows access if the specified header has
// one of the valid values
func APIKeyMiddleware(allowedKeys []string, headerName string) gin.HandlerFunc {
	if headerName == "" {
		headerName = HeaderXApiKey
	}

	keyMap := map[string]bool{}
	for _, key := range allowedKeys {
		keyMap[key] = true
	}

	return func(c *gin.Context) {
		providedKey := c.GetHeader(headerName)

		if _, ok := keyMap[providedKey]; ok {
			// Ok, we found a key, proceed to next handler
			return
		}

		c.AbortWithStatus(http.StatusUnauthorized)
	}
}

type personIDQuery struct {
	PersonID string `form:"personID"`
}

// GetEnrichmentData for the provided user id
func (s Server) GetEnrichmentData(c *gin.Context) {
	q := &personIDQuery{}
	err := c.BindQuery(q)
	if err != nil {
		c.AbortWithStatus(http.StatusBadRequest)
		log.L.Debug().Err(err).Msg("Bad request")
		return
	}

	userData, err := analytics.GetAnalyticsData(c.Request.Context(), s.fs, s.analyticsClient, q.PersonID)
	if err != nil {
		c.AbortWithStatus(http.StatusInternalServerError)
		log.L.Debug().Err(err).Msg("Unable to get user analytics data")
		return
	}

	c.JSON(http.StatusOK, userData)
}
