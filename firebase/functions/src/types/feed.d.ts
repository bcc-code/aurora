export interface FeedRefs {
    feedIncoming? (): FirebaseFirestore.CollectionReference,
    feedApproved? (): FirebaseFirestore.CollectionReference,
}

export interface FeedActions {
    submitFeedEntry? (input: FeedEntry): Promise<void>,
}

export interface FeedEntry {
    personId: number,
    firstName: string,
    lastName: string,
    displayName: string,
    churchName: string,
    countryName: string,
    text: string,
    imageUrl: string,
    approvedDate?: number,
    date?: number
}