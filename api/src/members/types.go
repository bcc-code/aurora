package members

import (
	"time"

	"github.com/araddon/dateparse"
	"go.bcc.media/bcco-api/log"
	"gopkg.in/guregu/null.v4"
)

// Generated types for parsing API response

// MemberLookupResult returned by the "/person" endpoint
type MemberLookupResult struct {
	Total uint32
	Limit uint32
	Skip  uint32
	Data  []*Member
}

type Phone struct {
	Country     string `json:"country"`
	Formatted   string `json:"formatted"`
	Number      string `json:"number"`
	Prefix      string `json:"prefix"`
	UnFormatted string `json:"unFormatted"`
}

type Country struct {
	ID          string `json:"_id"`
	Key         string `json:"_key"`
	Rev         string `json:"_rev"`
	CountryGUID string `json:"countryGuid"`
	CountryID   int    `json:"countryID"`
	Iso2Code    string `json:"iso2Code"`
	NameEn      string `json:"nameEn"`
	NameNative  string `json:"nameNative"`
	NameNo      string `json:"nameNo"`
}

type Address struct {
	Address1   string      `json:"address1"`
	Address2   string      `json:"address2"`
	Address3   interface{} `json:"address3"`
	Address4   interface{} `json:"address4"`
	City       interface{} `json:"city"`
	Country    Country     `json:"country"`
	PostalCode interface{} `json:"postalCode"`
}

type Org struct {
	ID              string  `json:"_id"`
	Key             string  `json:"_key"`
	ChurchID        int     `json:"churchID"`
	Name            string  `json:"name"`
	OrgID           int     `json:"orgID"`
	VisitingAddress Address `json:"visitingAddress"`
}

type Church struct {
	From         string    `json:"_from"`
	ID           string    `json:"_id"`
	Key          string    `json:"_key"`
	To           string    `json:"_to"`
	Active       bool      `json:"active"`
	InitialAudit bool      `json:"initial_audit"`
	Org          Org       `json:"org"`
	StartDate    time.Time `json:"startDate"`
}

type OrgConsent struct {
	Approved    bool      `json:"approved"`
	ChangedBy   int       `json:"changedBy"`
	ChangedDate time.Time `json:"changedDate"`
	Name        string    `json:"name"`
	OrgID       string    `json:"orgId"`
}

type PrivacyPolicy struct {
	Approved    bool      `json:"approved"`
	ChangedBy   int       `json:"changedBy"`
	ChangedDate time.Time `json:"changedDate"`
}

type Consent struct {
	Org           map[string]OrgConsent `json:"org"`
	PrivacyPolicy PrivacyPolicy         `json:"privacyPolicy"`
}

type DavidsColumn struct {
	Category string  `json:"category"`
	Count    float64 `json:"count"`
}

type Affiliations struct {
	From         string    `json:"_from"`
	ID           string    `json:"_id"`
	Key          string    `json:"_key"`
	To           string    `json:"_to"`
	InitialAudit bool      `json:"initial_audit"`
	StartDate    time.Time `json:"startDate"`
	Org          Org       `json:"org"`
	Active       bool      `json:"active"`
}

type RelatedPerson struct {
	ID               string `json:"_id"`
	Key              string `json:"_key"`
	ActiveStatusCode int    `json:"activeStatusCode"`
	Age              int    `json:"age"`
	BirthDateRaw     string `json:"birthDate"`
	BirthDate        time.Time
	Church           Church `json:"church"`
	DisplayName      string `json:"displayName"`
	GenderCode       int    `json:"genderCode"`
	PersonID         int    `json:"personID"`
}

type Roles struct {
	Name          string   `json:"name"`
	EnumName      string   `json:"enumName"`
	OrgIds        []string `json:"org_ids"`
	OrgIDs        []int    `json:"orgIDs"`
	Scope         string   `json:"scope"`
	SecurityLevel int      `json:"securityLevel"`
}

type Related struct {
	Affiliations []Affiliations  `json:"affiliations"`
	Children     []RelatedPerson `json:"children"`
	Dependents   []interface{}   `json:"dependents"`
	Guardians    []interface{}   `json:"guardians"`
	Parents      []RelatedPerson `json:"parents"`
	Roles        []Roles         `json:"roles"`
	Spouse       []RelatedPerson `json:"spouse"`
}

type Telegram struct {
	TelegramImpersonating         bool `json:"telegramImpersonating"`
	TelegramImpersonatingPersonID int  `json:"telegramImpersonatingPersonID"`
	TelegramUserID                int  `json:"telegramUserId"`
}

type Member struct {
	ID                        string    `json:"_id"`
	Key                       string    `json:"_key"`
	ActiveRole                string    `json:"activeRole"`
	ActiveStatusCode          int       `json:"activeStatusCode"`
	Administrator             bool      `json:"administrator"`
	Age                       int       `json:"age"`
	BccNorwayStartdate        time.Time `json:"bccNorwayStartdate"`
	BirthDateRaw              string    `json:"birthDate"`
	BirthDate                 time.Time
	BirthdayList              bool         `json:"birthdayList"`
	CellPhone                 Phone        `json:"cellPhone"`
	Church                    Church       `json:"church"`
	ChurchID                  int          `json:"churchID"`
	Consent                   Consent      `json:"consent"`
	CultureCode1              string       `json:"cultureCode1"`
	CultureCode2              string       `json:"cultureCode2"`
	CultureCode3              string       `json:"cultureCode3"`
	CurrentAddress            Address      `json:"currentAddress"`
	DavidsColumn              DavidsColumn `json:"davidsColumn"`
	DeceasedDate              interface{}  `json:"deceasedDate"`
	DisplayName               string       `json:"displayName"`
	Email                     string       `json:"email"`
	FirstName                 string       `json:"firstName"`
	GenderCode                int          `json:"genderCode"`
	Gender                    string       `json:"gender"`
	GuardianDisplayName       string       `json:"guardianDisplayName"`
	GuardianID                null.Int     `json:"guardianID"`
	HomePhone                 Phone        `json:"homePhone"`
	InitialAudit              bool         `json:"initial_audit"`
	LastChangedDate           time.Time    `json:"lastChangedDate"`
	LastName                  string       `json:"lastName"`
	LastNamePrefix            string       `json:"lastNamePrefix"`
	MaritalStatusCode         int          `json:"maritalStatusCode"`
	MiddleName                interface{}  `json:"middleName"`
	PersonID                  int          `json:"personID"`
	PersonNumber              string       `json:"personNumber"`
	ProfilePicture            string       `json:"profilePicture"`
	ProfileVisibility         int          `json:"profileVisibility"`
	Related                   Related      `json:"related"`
	RequiresGuardian          bool         `json:"requiresGuardian"`
	SecondGuardianDisplayName string       `json:"secondGuardianDisplayName"`
	SecondGuardianID          null.Int     `json:"secondGuardianID"`
	SignonUserAccountGUID     string       `json:"signonUserAccountGuid"`
	SignonUsername            string       `json:"signonUsername"`
	SubsidyContributor        bool         `json:"subsidyContributor"`
	SyncStatus                string       `json:"syncStatus"`
	Telegram                  Telegram     `json:"telegram"`
	TelephoneList             bool         `json:"telephoneList"`
	VerifiedCode              interface{}  `json:"verifiedCode"`
}

// ParseBday to a time struct
func (m *Member) ParseBday() {
	birthDate, err := dateparse.ParseStrict(m.BirthDateRaw)
	if err != nil {
		log.L.Warn().Str("date", m.BirthDateRaw).Msg("Unable to parse date")
		return
	}

	m.BirthDate = birthDate
}
