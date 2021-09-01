package auth0

import (
	"context"
	"fmt"

	"github.com/lestrrat-go/jwx/jwk"
	"go.bcc.media/bcco-api/log"
)

var jwksMap map[string]jwk.Set = map[string]jwk.Set{}

// GetKeySet for the specified domain.
// The result is cached for the lifetime of the program
func GetKeySet(domain string) jwk.Set {
	if keySet, ok := jwksMap[domain]; ok {
		return keySet
	}

	keyURL := fmt.Sprintf("https://%s/.well-known/jwks.json", domain)
	keySet, err := jwk.Fetch(context.Background(), keyURL)
	if err != nil {
		log.L.Error().
			Err(err).
			Msg("Unable to get PEM 1")
		return nil
	}

	jwksMap[domain] = keySet
	return keySet
}
