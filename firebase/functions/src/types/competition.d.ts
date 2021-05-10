export interface CompetitionUpdate {
    user?: FirebaseFirestore.DocumentReference
    distance: number
    distanceToBeApproved: number
    churchId?: number
}

export interface CompetitionRequestBody {
    personId?: string
    distance?: number
    overrideMaxDistance?: number
}

export interface CompetitionRequestQuery {
    competitionId?: string
}
