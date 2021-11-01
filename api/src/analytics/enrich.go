package analytics

import (
	"context"
	"math"
	"time"

	"cloud.google.com/go/firestore"
	"go.bcc.media/bcco-api/firebase"
	"go.bcc.media/bcco-api/log"
)

type ageGroup string

// AgeGroup constants
const (
	AgeGroupUnknown = "UNKNOWN"
	AgeGroupUnder10 = "< 10"
	AgeGroup10to12  = "10 - 12"
	AgeGroup13to18  = "13 - 18"
	AgeGroup19to25  = "19 - 26"
	AgeGroup26to36  = "26 - 36"
	AgeGroup37to64  = "37 - 64"
	AgeGroupOver65  = "65+"
)

// UserData for analytics purposes
// Do not contain names or non-analytics unique identifiers
// Birthdate is replaced by a AgeGroup
type UserData struct {
	ChurchName  string
	CountryName string
	AgeGroup    ageGroup
	AnalyticsID string
	Gender      string
}

func getAgeGroup(bd string) ageGroup {
	bdTime, err := time.Parse(time.RFC3339, bd)
	if err != nil {
		log.L.Warn().Str("bday", bd).Err(err).Stack().Msg("Unable to parse date")
		return AgeGroupUnknown
	}

	age := math.Floor(time.Now().Sub(bdTime).Hours() / 24.0 / 365.0)
	if age < 1 {
		return AgeGroupUnknown
	} else if age < 11 {
		return AgeGroupUnder10
	} else if age <= 12 {
		return AgeGroup10to12
	} else if age <= 18 {
		return AgeGroup13to18
	} else if age <= 25 {
		return AgeGroup19to25
	} else if age <= 36 {
		return AgeGroup26to36
	} else if age <= 64 {
		return AgeGroup37to64
	}
	return AgeGroupOver65
}

// GetAnalyticsData gets anonymized data about the specified person ID
func GetAnalyticsData(ctx context.Context, firestoreClient *firestore.Client, analyticsClient *Client, personID string) (UserData, error) {
	user, err := firebase.GetUser(ctx, *firestoreClient, personID)
	if err != nil {
		return UserData{}, err
	}

	return UserData{
		ChurchName:  user.ChurchName,
		CountryName: user.CountryName,
		AgeGroup:    getAgeGroup(user.Birthdate),
		AnalyticsID: analyticsClient.GetID(float64(user.PersonId)),
		Gender:      user.Gender,
	}, nil
}
