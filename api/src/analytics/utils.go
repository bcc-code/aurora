package analytics

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"fmt"
)

// GenerateID for use in analytics based on the personID
func GenerateID(personID float64, key string) string {
	h := hmac.New(sha256.New, []byte(key))
	sum := h.Sum([]byte(fmt.Sprintf("%.0f", personID)))
	return base64.StdEncoding.EncodeToString(sum)
}
