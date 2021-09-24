package main

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

// GenerateAnalyticsID for the user requesting
func (s Server) GenerateAnalyticsID(c *gin.Context) {
	var personID float64

	if pid, ok := c.Get("PersonID"); ok {
		personID = pid.(float64)
	} else {
		c.AbortWithStatus(http.StatusUnauthorized)
		return
	}

	id := generateAnalyticsID(personID, s.analyticsIDSecret)

	c.JSON(http.StatusOK, gin.H{"id": string(id)})
}

func generateAnalyticsID(personID float64, key string) string {
	h := hmac.New(sha256.New, []byte(key))
	sum := h.Sum([]byte(fmt.Sprintf("%.0f", personID)))
	return base64.StdEncoding.EncodeToString(sum)
}
