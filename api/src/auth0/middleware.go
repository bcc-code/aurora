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
	Domain    string
	Issuer    string
	Audiences []string
}

func JWTCheck(ctx context.Context, config JWTConfig, app *firebase.App) gin.HandlerFunc {
	jwks := GetKeySet(config.Domain)
	client, err := app.Auth(ctx)
	if err != nil {
		log.L.Panic().Err(err).Msg("error getting Auth client")
	}

	return func(c *gin.Context) {
		ctx := c.Request.Context()
		apiToken := c.GetHeader("x-api-token") // TODO: Replace with const
		if apiToken != "" {
			_, err := client.VerifyIDToken(ctx, apiToken)
			if err != nil {
				log.L.Debug().Err(err).Msg("Validating x-api-token")
				c.AbortWithStatus(http.StatusUnauthorized)
				return
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

		valid := false
		errors := []error{}

		// Loop all allowed audiences, and collect errors
		// If none pass then print all errors for easier debugging,
		// else we can ignore the errors since we found a ok combo
		for _, audience := range config.Audiences {
			err := jwt.Validate(
				token,
				jwt.WithIssuer(config.Issuer),
				jwt.WithAudience(audience),
			)

			if err != nil {
				errors = append(errors, err)
			} else {
				valid = true
				break
			}
		}

		if !valid {
			log.L.Debug().
				Errs("Validation errors", errors).
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
