package firebase

import (
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"net/url"
	"os"

	"cloud.google.com/go/firestore"
	"go.bcc.media/bcco-api/members"
	"google.golang.org/genproto/googleapis/type/latlng"
)

// Church contains basic (mostly geo) data about a church place
type Church struct {
	ChurchID    int             `firestore:"churchId"`
	Country     string          `firestore:"country"`
	CountryCode string          `firestore:"countryCode"`
	Name        string          `firestore:"name"`
	Coordinates *latlng.LatLng  `firestore:"coordinates"`
	Address     members.Address `firestore:"address"`
	Continent   string          `firestore:"continent"`
}

func (c Church) UpdateFromMembers(church *members.Org) Church {
	c.Name = church.Name
	c.Country = church.VisitingAddress.Country.NameEn
	c.CountryCode = church.VisitingAddress.Country.Iso2Code
	c.ChurchID = church.ChurchID
	c.Address = church.VisitingAddress

	return c
}

type geocodeResponse struct {
	Data []struct {
		Latitude           float64 `json:"latitude"`
		Longitude          float64 `json:"longitude"`
		Type               string  `json:"type"`
		Name               string  `json:"name"`
		Number             string  `json:"number"`
		PostalCode         string  `json:"postal_code"`
		Street             string  `json:"street"`
		Confidence         float32 `json:"confidence"`
		Region             string  `json:"region"`
		RegionCode         string  `json:"region_code"`
		County             string  `json:"county"`
		Locality           string  `json:"locality"`
		AdministrativeArea string  `json:"administrative_area"`
		Neighbourhood      string  `json:"neighbourhood"`
		Country            string  `json:"country"`
		CountryCode        string  `json:"country_code"`
		Continent          string  `json:"continent"`
		Label              string  `json:"label"`
	} `json:"data"`
}

func (c *Church) doGeocode() error {
	apiKey := os.Getenv("POSITIONSTACK_KEY")
	address := url.QueryEscape(fmt.Sprintf("%s,%s,%s,%s", c.Address.Address1, c.Address.Address2, c.Address.Address3, c.Address.Address4))
	resp, err := http.Get(fmt.Sprintf("http://api.positionstack.com/v1/forward?limit=1&access_key=%s&query=%s", apiKey, address))
	if err != nil {
		return err
	}
	//We Read the response body on the line below.

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return err
	}

	res := geocodeResponse{}
	err = json.Unmarshal(body, &res)
	if err != nil {
		return err
	}

	if len(res.Data) < 1 {
		return nil
	}

	pos := &latlng.LatLng{}
	pos.Latitude = res.Data[0].Latitude
	pos.Longitude = res.Data[0].Longitude
	c.Coordinates = pos
	c.Continent = res.Data[0].Continent
	return nil
}

// Upsert church into the DB
func (c Church) Upsert(ctx context.Context, client *firestore.Client) error {
	fbChurch := client.Doc(fmt.Sprintf("churches/%.0d", c.ChurchID))
	fbChurchSnapshot, err := fbChurch.Get(ctx)
	if err != nil {
		return err
	}

	if !fbChurchSnapshot.Exists() {
		err := c.doGeocode()
		if err != nil {
			return err
		}
		_, err = fbChurch.Create(ctx, c)
	}
	/*
		if co, _ := fbChurchSnapshot.DataAt("coordinates"); co == nil {
			err := c.doGeocode()
			if err != nil {
				return err
			}
		}
	*/
	updates := []firestore.Update{
		{
			Path:  "name",
			Value: c.Name,
		},
		{
			Path:  "country",
			Value: c.Country,
		},
		{
			Path:  "countryCode",
			Value: c.CountryCode,
		},
		{
			Path:  "churchId",
			Value: c.ChurchID,
		},
		{
			Path:  "address",
			Value: c.Address,
		},
		{
			Path:  "coordinates",
			Value: c.Coordinates,
		},
	}

	if c.Coordinates != nil {
		updates = append(updates, firestore.Update{
			Path:  "continent",
			Value: c.Continent,
		})
	}

	_, err = fbChurch.Update(ctx, updates)

	return err

}
