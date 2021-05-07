export interface IUser {
  personId: number;
  uid?: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  birthdate?: string;
  genderId?: number;
  guardian1Id?: number;
  guardian2Id?: number;
  churchId?: number;
  churchName?: string;
  countryName?: string;
  linkedUserIds?: Array<number>;
  hasMembership?: boolean;
  profilePicture?: string;
}
