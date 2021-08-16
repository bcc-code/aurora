package members

import (
	"fmt"
	"net/http"

	"github.com/go-resty/resty/v2"
	"github.com/rs/zerolog"
)

// Client allows accessing the MembersAPI
type Client struct {
	httpClient  *resty.Client
	accessToken string
	domain      string
	log         *zerolog.Logger
}

// NewClient for members API
func NewClient(httpClient *http.Client, domain, accessToken string, logClient *zerolog.Logger) *Client {
	c := resty.NewWithClient(httpClient).
		EnableTrace().
		SetHeader("x-access-token", accessToken).
		SetHeader("Content-Type", "application/json")

	if logClient == nil {
		logClient = &zerolog.Logger{}
	}

	return &Client{
		httpClient:  c,
		domain:      domain,
		accessToken: accessToken,
		log:         logClient,
	}
}

// GetMemberData from the API
// Includes details about the members organization
// Related persons are listed but include only some of the details
func (c Client) GetMemberData(memberID string) (*Member, error) {
	req := c.httpClient.R().SetResult(MemberLookupResult{})
	req.QueryParam.Add("personID", memberID)
	res, err := req.Get(fmt.Sprintf("https://%s/person", c.domain))

	if err != nil {
		c.log.Error().Err(err).Msg("Request returned an error")
		return nil, err
	}

	if !res.IsSuccess() { // != 4xx status
		c.log.Error().Bytes("body", res.Body()).Msg("Request returned 4xx")
		return nil, err
	}

	result := res.Result().(*MemberLookupResult)
	if result == nil || result.Total != 1 {
		return &Member{}, nil
	}

	return result.Data[0], nil
}
