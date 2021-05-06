export interface BukGameRefs {
  bukGame?(): FirebaseFirestore.DocumentReference;
  entries?(): FirebaseFirestore.CollectionReference;
  entry?(personId: number): FirebaseFirestore.DocumentReference;
  banlist?(): FirebaseFirestore.CollectionReference;
  userBan?(personId: number): FirebaseFirestore.DocumentReference;
  user?(personId: number): FirebaseFirestore.DocumentReference;
}

export interface BukGameActions {
  banUser?(personId: number): Promise<void>;
  unbanUser?(personId: number): Promise<void>;
  updateEntry?(
    personId: number,
    game: string,
    score: number
  ): Promise<BukGameEntry>;
}

export interface BukGameEntry {
  [i: string]: string | number | undefined;
  displayName?: string;
  churchName?: string;
  countryName?: string;
  profilePictureThumb?: string;
}
