package analytics

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"fmt"
	"math"
	"math/rand"

	"go.bcc.media/bcco-api/log"
)

// GenerateID for use in analytics based on the personID
func GenerateID(personID float64, key string) string {

	// The next 2 ifs are there for now to guard against paths that could possibly
	// deliver bogus values. They should not be removed unless there is a strong guarantee
	// that they, but especially the key, can NOT be empty
	if personID == 0 {
		log.L.Warn().Msg("Empty person ID passed. Setting to random negative number")
		personID = rand.Float64() * math.MaxFloat64 * -1
	}

	if key == "" {
		log.L.Warn().Msg("Key passed to GenerateID is empty. Setting random key")
		key = fmt.Sprintf("%d", rand.Int63n(math.MaxInt64))
	}

	// We hash the person ID first to get a more "lively" hash, otherwise it is possible
	// to deduce (at least it was with empty key) what relative personID has been encoded
	// in a HMAC if you know one (and you know yours).
	hashedPersonID := sha256.Sum256([]byte(fmt.Sprintf("%.0f", personID)))
	h := hmac.New(sha256.New, []byte(key))
	sum := h.Sum(hashedPersonID[:]) // [:] converts from a fixed size array to a slice
	return base64.StdEncoding.EncodeToString(sum)
}
