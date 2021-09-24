package firebase

import (
	"fmt"
	"net/http"

	"cloud.google.com/go/firestore"
	"github.com/gin-gonic/gin"
	"go.bcc.media/bcco-api/log"
)

type role string

func (r role) String() string {
	return string(r)
}

// Various roles that can be used to limit functionality
const (
	Admin      role = "administrator"
	Publisher  role = "publisher"
	Translator role = "translator"
)

// Roles is a helper to create an array of private types
func Roles(roles ...role) []role {
	return roles
}

type fbPermission struct {
	Role role
}

// ValidateRole denies requests to persons that do not have one of the specified roles
func ValidateRole(fs *firestore.Client, roles []role) gin.HandlerFunc {
	return func(c *gin.Context) {
		if c.IsAborted() {
			return
		}

		var personID float64
		if pid, ok := c.Get("PersonID"); ok {
			personID = pid.(float64)
		} else {
			c.AbortWithStatus(http.StatusUnauthorized)
			return
		}

		permissionRef, err := fs.Collection("permissions").Doc(fmt.Sprintf("%.0f", personID)).Get(c.Request.Context())
		if err != nil {
			log.L.Error().
				Err(err).
				Msg("Error while getting roles from Firebase")
			c.AbortWithStatus(http.StatusUnauthorized)
		}

		p := fbPermission{}
		err = permissionRef.DataTo(&p)
		if err != nil {
			log.L.Error().
				Err(err).
				Msg("Error while parsing roles from FB")
			c.AbortWithStatus(http.StatusUnauthorized)
		}

		for _, allowed := range roles {
			if allowed == p.Role {
				// We found a ok case, just continue
				return
			}
		}

		log.L.Debug().
			Float64("PersonID", personID).
			Str("roles", fmt.Sprintf("%+v", roles)).
			Msg("Unauthorized person")

		c.AbortWithStatus(http.StatusUnauthorized)
	}
}
