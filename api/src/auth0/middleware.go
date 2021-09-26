package auth0

import (
	"context"
	"net/http"

	firebase "firebase.google.com/go"
	"github.com/gin-gonic/gin"
	"github.com/lestrrat-go/jwx/jwt"
	"go.bcc.media/bcco-api/log"
)

type JWTConfig struct {
	Domain   string
	Issuer   string
	Audience string
}

func JWTCheck(ctx context.Context, config JWTConfig, app *firebase.App) gin.HandlerFunc {
	jwks := GetKeySet(config.Domain)
	client, err := app.Auth(ctx)
	if err != nil {
		log.L.Panic().Err(err).Msg("error getting Auth client")
	}

	return func(c *gin.Context) {
		ctx := c.Request.Context()
		apiToken := c.GetHeader("x-api-token")

		if apiToken != "" {
			_, err := client.VerifyIDToken(ctx, apiToken)
			if err != nil {
				c.AbortWithStatus(http.StatusUnauthorized)
				log.L.Debug().Err(err)
			}

			// Token accepted
			return
		}

		// middleware
		token, err := jwt.ParseRequest(
			c.Request,
			jwt.WithKeySet(jwks),
			jwt.WithHeaderKey("Authorization"),
		)

		if err != nil {
			c.AbortWithStatus(http.StatusUnauthorized)
			log.L.Debug().Err(err)
			return
		}

		err = jwt.Validate(
			token,
			jwt.WithIssuer(config.Issuer),
			jwt.WithAudience(config.Audience),
		)

		if err != nil {
			log.L.Debug().
				Err(err).
				Msg("Validation")
			c.AbortWithStatus(http.StatusUnauthorized)
			return
		}

		if val, ok := token.Get("https://login.bcc.no/claims/personId"); ok {
			c.Set("PersonID", val)
		} else {
			c.AbortWithStatus(http.StatusUnauthorized)
			return
		}
	}
}
