package firebase

import (
	"context"
	"fmt"
	"reflect"
	"time"

	"cloud.google.com/go/firestore"
	"go.bcc.media/bcco-api/members"
)

// User represents a user in the system as represented in the firebase
type User struct {
	Birthdate     string
	ChurchName    string
	CountryName   string
	DisplayName   string
	FirstName     string
	Guardian1Id   int
	Guardian2Id   int
	LastName      string
	LastUpdated   string
	LinkedUserIds []int
	PersonId      int
	Uid           string
}

// UpdateWithMember data as provided
func (u User) UpdateWithMember(member *members.Member) (User, bool) {
	// TODO: Skip if changed date is in the past and return false
	u.Birthdate = member.BirthDate.Format(time.RFC3339)
	u.ChurchName = member.Church.Org.Name
	u.CountryName = member.Church.Org.VisitingAddress.Country.NameEn
	u.FirstName = member.FirstName
	u.LastName = member.LastName
	u.DisplayName = member.DisplayName
	u.Guardian1Id = member.GuardianID
	u.Guardian2Id = member.SecondGuardianID
	u.LastUpdated = member.LastChangedDate.Format(time.RFC3339)
	for _, r := range member.Related.Children {
		u.LinkedUserIds = append(u.LinkedUserIds, r.PersonID)
	}

	return u, true
}

// UpdateUser in firebase
func UpdateUser(ctx context.Context, client *firestore.Client, member *members.Member) error {
	fbUser, err := client.Collection("users").Doc(fmt.Sprintf("%.0d", member.PersonID)).Get(ctx)
	if err != nil {
		return err
	}

	user := User{}
	err = fbUser.DataTo(&user)
	if err != nil {
		return err
	}

	updatedUser, updated := user.UpdateWithMember(member)
	if !updated || reflect.DeepEqual(user, updatedUser) {
		return nil
	}

	_, err = fbUser.Ref.Set(ctx, updatedUser)
	return err

}
