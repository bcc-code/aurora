package firebase

import (
	"context"
	"fmt"
	"reflect"
	"time"

	"cloud.google.com/go/firestore"
	"go.bcc.media/bcco-api/members"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

// User represents a user in the system as represented in the firebase
type User struct {
	Birthdate     string
	ChurchName    string
	CountryName   string
	DisplayName   string
	FirstName     string
	Guardian1Id   *int64
	Guardian2Id   *int64
	LastName      string
	LastUpdated   string
	LinkedUserIds []int
	Gender        string
	PersonId      int
	Uid           string
}

// UpdateWithMember data as provided
func (u User) UpdateWithMember(member *members.Member) (User, bool) {
	member.ParseBday()
	// TODO: Skip if changed date is in the past and return false
	u.Birthdate = member.BirthDate.Format(time.RFC3339)
	u.ChurchName = member.Church.Org.Name
	u.CountryName = member.Church.Org.VisitingAddress.Country.NameEn
	u.FirstName = member.FirstName
	u.LastName = member.LastName
	u.DisplayName = member.DisplayName
	u.Gender = member.Gender
	if member.GuardianID.Valid {
		u.Guardian1Id = &member.GuardianID.Int64
	}

	if member.SecondGuardianID.Valid {
		u.Guardian2Id = &member.SecondGuardianID.Int64
	}
	u.LastUpdated = member.LastChangedDate.Format(time.RFC3339)
	u.LinkedUserIds = []int{}
	for _, r := range member.Related.Children {
		u.LinkedUserIds = append(u.LinkedUserIds, r.PersonID)
	}

	return u, true
}

// GetUser from firebase
func GetUser(ctx context.Context, client firestore.Client, personID string) (User, error) {
	user := User{}
	fbUser, err := client.Collection("users").Doc(personID).Get(ctx)
	if err != nil {
		return user, err
	}

	err = fbUser.DataTo(&user)
	return user, err
}

// UpdateOrCreateUser in firebase
func UpdateOrCreateUser(ctx context.Context, client *firestore.Client, member *members.Member) error {
	fbUser, err := client.Collection("users").Doc(fmt.Sprintf("%.0d", member.PersonID)).Get(ctx)
	if status.Code(err) == codes.NotFound {
		u := User{}
		u.UpdateWithMember(member)
		_, err = fbUser.Ref.Create(ctx, u)
		return err
	}

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
	if status.Code(err) == codes.NotFound {
		_, err = fbUser.Ref.Create(ctx, updatedUser)
	}
	return err

}
