package auth0

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/lestrrat-go/jwx/jwt"
	"go.bcc.media/bcco-api/log"
)

type JWTConfig struct {
	Domain   string
	Issuer   string
	Audience string
}

func JWTCheck(config JWTConfig) gin.HandlerFunc {
	jwks := GetKeySet(config.Domain)

	return func(c *gin.Context) {
		// middleware
		token, err := jwt.ParseRequest(
			c.Request,
			jwt.WithKeySet(jwks),
			jwt.WithHeaderKey("Authorization"),
		)

		if err != nil {
			log.L.Debug().
			Err(err).
			Msg("Token not found")

			c.AbortWithStatus(http.StatusUnauthorized)
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
