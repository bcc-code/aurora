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

export interface UserRefs {
  churches?(): FirebaseFirestore.CollectionReference;
  church?(churchId: number): FirebaseFirestore.DocumentReference;
  users?(): FirebaseFirestore.CollectionReference;
  user?(personId: number): FirebaseFirestore.DocumentReference;
  permissions?(): FirebaseFirestore.CollectionReference;
}

export interface UserGetters {
  isAdmin?(personId: number): Promise<boolean>;
  role?(personId: number): Promise<string>;
}

export interface UserActions {
  createOrUpdate?(update: IUser): Promise<FirebaseFirestore.DocumentData>;
  syncUserAndClaims?(loggedInUser: any): any;
  getUserDocs?(
    limit: number,
    startAfter: number,
    includeInactive?: boolean
  ): Promise<Array<FirebaseFirestore.QueryDocumentSnapshot>>;
  updateProfileImageUrl?(
    personId: number,
    imageUrl: string,
    thumbnailUrl: string
  ): Promise<void>;
}
