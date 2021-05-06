export interface FeedRefs {
  feedIncoming?(): FirebaseFirestore.CollectionReference;
  feedApproved?(): FirebaseFirestore.CollectionReference;
}

export interface FeedActions {
  submitFeedEntry?(personId: number, input: FeedEntry): Promise<void>;
}

export interface FeedEntry {
  firstName: string;
  lastName: string;
  displayName: string;
  churchName: string;
  countryName: string;
  text: string;
  imageUrl: string;
  approvedDate?: number;
  date?: number;
}
