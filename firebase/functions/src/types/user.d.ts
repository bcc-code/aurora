export interface IUser {
    PersonId: number
    Uid?: string
    FirstName?: string
    LastName?: string
    DisplayName?: string
    Birthdate?: string
    GenderId?: number
    Guardian1Id?: number
    Guardian2Id?: number
    ChurchId?: number
    ChurchName?: string
    CountryName?: string
    LinkedUserIds?: Array<number>
    HasMembership?: boolean
    ProfilePicture?: string
}
