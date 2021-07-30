package main

import (
	"net/http"

	"github.com/gin-contrib/cors"
	"github.com/gin-contrib/logger"
	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog"

	"go.bcc.media/bcco-background/log"
)

func main() {
	log.ConfigureGlobalLogger(zerolog.DebugLevel)

	router := gin.Default()
	router.Use(logger.SetLogger(logger.Config{
		Logger: log.L,
	}))

	router.Use(cors.New(cors.Config{
		AllowOrigins:  []string{"*"},
		AllowMethods:  []string{"GET"},
		AllowHeaders:  []string{"Origin"},
		ExposeHeaders: []string{"Content-Length"},
	}))

	router.POST("pubsub-push", dummy)
}

func dummy(c *gin.Context) {
	log.L.Debug().Msgf("Got: %+v", c.Request.Body)
	c.JSON(http.StatusOK, []string{})
}
