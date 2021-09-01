package auth0

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/lestrrat-go/jwx/jwt"
	"go.bcc.media/bcco-api/log"
)

func JWTCheck(domain string) gin.HandlerFunc {
	jwks := GetKeySet(domain)

	return func(c *gin.Context) {
		// middleware
		token, err := jwt.ParseRequest(
			c.Request,
			jwt.WithKeySet(jwks),
			jwt.WithHeaderKey("Authorization"),
		)

		err = jwt.Validate(
			token,
			jwt.WithIssuer("https://login.bcc.no/"),
			jwt.WithAudience("1J2g4gsQX11e5WD7kgjlbeQj0qx14kfz"),
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
