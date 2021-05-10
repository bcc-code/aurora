import { Dictionary } from 'lodash'

export interface PollRefs {
    gameboardCol?(): FirebaseFirestore.CollectionReference
    gameboard?(): FirebaseFirestore.DocumentReference
    questions?(): FirebaseFirestore.CollectionReference
    question?(questionId: number | string): FirebaseFirestore.DocumentReference
    answers?(questionId: number | string): FirebaseFirestore.CollectionReference
    responses?(): FirebaseFirestore.CollectionReference
    response?(
        personId: number,
        questionId: number | string
    ): FirebaseFirestore.DocumentReference
    responseStats?(): FirebaseFirestore.DocumentReference
    pollStats?(): FirebaseFirestore.CollectionReference
    pollConfig?(): FirebaseFirestore.DocumentReference
    pollSummary?(): FirebaseFirestore.DocumentReference
    qaShard?(
        questionId: number | string,
        answerId: number | string,
        index: number
    ): FirebaseFirestore.DocumentReference
}

export interface PollActions {
    loadPollData?(initShards?: boolean): Promise<PollData>
    startPolls?(questionIds: Array<number | string>): Promise<void>
    pollClearAll?(): Promise<void>
    setPollResponse?(
        userDoc: FirebaseFirestore.DocumentData,
        questionId: number | string,
        selectedAnswers: Array<string>
    ): Promise<FirebaseFirestore.DocumentReference>
    pickRandomWinner?(questionId: number | string): Promise<{} | boolean>
    updatePollStats?(
        currentQuestionId: number | string
    ): Promise<{} | PollStats>
    updateResponseStats?(
        bucketPathsCommaSep: string,
        questionIdArray: Array<number | string>
    ): {}
}

export interface PollData {
    questions: FirebaseFirestore.QuerySnapshot
    answers: Dictionary<Array<FirebaseFirestore.DocumentData>>
}

export interface PollStats {
    total: { total: number; correct: number }
    currentQuestion: number
    currentTotal: number
}
