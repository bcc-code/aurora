export interface CompetitionRefs {
    competition? (): FirebaseFirestore.DocumentReference,
    entry? (personId: number): FirebaseFirestore.DocumentReference,
    distanceShards? (): FirebaseFirestore.CollectionReference,
    distanceShard? (shardId: number): FirebaseFirestore.DocumentReference,
    distancesPerChurch? (): FirebaseFirestore.CollectionReference,
    distancePerChurch? (churchId: number): FirebaseFirestore.DocumentReference,
    user? (personId: number): FirebaseFirestore.DocumentReference
}

export interface CompetitionActions {
    updateEntry? (personId: number, distance: number, overrideMax: number): Promise<CompetitionUpdate>
}

export interface CompetitionUpdate {
    user?: FirebaseFirestore.DocumentReference,
    distance?: number,
    distanceToBeApproved?: number,
    churchId?: number
}