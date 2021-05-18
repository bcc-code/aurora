import { deleteCollection, parallelAsync, sumDeep } from '../utils'
import { n } from '../constants'
import { UserModel } from '../user'
import _get from 'lodash/get'
import _set from 'lodash/set'
import { isNumber } from 'lodash'
import { Module } from './module'
import { logger } from '../../log'
import { firestore } from 'firebase-admin'
import { QueryDocumentSnapshot } from 'firebase-functions/lib/providers/firestore'

const log = logger('model/modules/poll')

type Answers = { [i: string]: QueryDocumentSnapshot[] }

export class PollModule extends Module {
    db: firestore.Firestore
    userModel: UserModel

    gameboardCol: firestore.CollectionReference
    gameboard: firestore.DocumentReference

    questions: firestore.CollectionReference
    responses: firestore.CollectionReference
    responseStats: firestore.DocumentReference
    pollStats: firestore.CollectionReference
    pollConfig: firestore.DocumentReference
    pollSummary: firestore.DocumentReference

    question(questionId: string): firestore.DocumentReference {
        return this.questions.doc(questionId)
    }

    answers(questionId: string): firestore.CollectionReference {
        return this.question(questionId).collection(n.answers)
    }

    response(
        personId: string,
        questionId: string
    ): firestore.DocumentReference {
        return this.responses.doc(`${personId}_${questionId}`)
    }

    qaShard(
        questionId: string,
        answerId: string,
        index: number
    ): firestore.DocumentReference {
        return this.pollStats.doc(`${questionId}_${answerId}_${index}`)
    }

    async loadPollData(
        initShards = false
    ): Promise<{ answers: Answers; questions: firestore.DocumentData }> {
        const questions = await this.questions.get()
        const answers: Answers = {}

        await Promise.all(
            questions.docs.map(async (questionDoc) => {
                const answerList = await this.answers(questionDoc.id).get()
                answers[questionDoc.id] = answerList.docs

                if (initShards) {
                    await parallelAsync(answerList.docs, async (answerDoc) => {
                        const p = []
                        for (let i = 0; i < n.pollStatsShardCount; i++) {
                            p.push(
                                this.qaShard(
                                    questionDoc.id,
                                    answerDoc.id,
                                    i
                                ).set({
                                    total: 0,
                                })
                            )
                        }
                        return Promise.all(p)
                    })
                }
            })
        )

        return {
            questions,
            answers,
        }
    }

    async startPolls(questionIds: string[]): Promise<void> {
        if (!(await this.gameboard.get()).exists) {
            await this.gameboard.set({})
        }

        const batch = this.db.batch()
        const pollQuestions: { [i: string]: firestore.DocumentData | null } = {}
        const pollAnswers: { [i: string]: firestore.DocumentData } = {}
        await Promise.all(
            questionIds.map(async (questionId: string) => {
                const questionRef = this.question(questionId)
                const question = await questionRef.get()
                if (!question.exists) {
                    throw new Error(`questionId ${questionId} does not exist`)
                }

                const answers = await this.answers(questionId).get()

                if (!question.data()?.initialized) {
                    answers.docs.forEach((answer) => {
                        for (let i = 0; i < n.pollStatsShardCount; i++) {
                            const shard = this.qaShard(questionId, answer.id, i)
                            batch.set(shard, { total: 0 })
                        }
                    })
                    batch.update(questionRef, { initialized: true })
                }

                pollQuestions[questionId] = question.data() ?? null
                pollAnswers[questionId] = answers.docs.map((a) => a.data())
            })
        )
        batch.update(this.gameboard, {
            poll: {
                questions: pollQuestions,
                answers: pollAnswers,
                visible: true,
                countdown: true,
                timeLimit: 30,
            },
        })
        await batch.commit()
    }

    async pollClearAll(): Promise<void> {
        await deleteCollection(this.db, this.responses.path, 300)
        await deleteCollection(this.db, this.pollStats.path, 300)
        await this.pollSummary.set({})
    }

    async setPollResponse(
        userDoc: firestore.DocumentData,
        questionId: string,
        selectedAnswers: string[]
    ): Promise<firestore.DocumentReference<firestore.DocumentData>> {
        if (!userDoc.exists) {
            throw new Error('User not provided')
        }
        const personId = userDoc.data().personId
        // make sure we don't already have a response for this personId + qustionId
        const responseDoc = await this.response(personId, questionId).get()
        const questionDoc = await this.question(questionId).get()

        if (responseDoc.exists && !questionDoc.data()?.canChangeAnswer) {
            throw new Error('Multiple poll responses are not permitted.')
        }

        const previousAnswers = responseDoc.exists
            ? responseDoc.data()?.selected
            : []
        const configDoc = await this.pollConfig.get()
        const bucketNames = configDoc.exists
            ? configDoc.data()?.bucketNames
            : []

        // no existing response
        const batch = this.db.batch()

        const response = {
            personId: personId as string,
            question: questionId,
            selected: selectedAnswers,
        }

        const responseDocRef = this.response(personId, questionId)

        // Select a shard of the counter based on personid
        const shardId = Math.floor(personId % 10)

        batch.set(responseDocRef, response)

        // new pollStats
        previousAnswers.forEach((answerId: string) => {
            batch.set(
                this.qaShard(questionId, answerId, shardId),
                { total: firestore.FieldValue.increment(-1) },
                { merge: true }
            )

            bucketNames.forEach((bucketName: string) => {
                let bucketValue = _get(userDoc.data(), bucketName)
                if (bucketValue === null || bucketValue === '') {
                    bucketValue = 'Unknown'
                }
                const updatedDoc: { [i: string]: firestore.FieldValue } = {}
                updatedDoc[
                    `${bucketName}.${bucketValue}`
                ] = firestore.FieldValue.increment(-1)
                batch.set(
                    this.qaShard(questionId, answerId, shardId),
                    updatedDoc,
                    {
                        merge: true,
                    }
                )
            })
        })

        selectedAnswers.forEach((answerId) => {
            batch.set(
                this.qaShard(questionId, answerId, shardId),
                { total: firestore.FieldValue.increment(1) },
                { merge: true }
            )

            bucketNames.forEach((bucketName: string) => {
                let bucketValue = _get(userDoc.data(), bucketName)
                if (bucketValue === null || bucketValue === '') {
                    bucketValue = 'Unknown'
                }

                const updatedDoc: { [i: string]: firestore.FieldValue } = {}
                updatedDoc[
                    `${bucketName}.${bucketValue}`
                ] = firestore.FieldValue.increment(1)
                batch.set(
                    this.qaShard(questionId, answerId, shardId),
                    updatedDoc,
                    {
                        merge: true,
                    }
                )
            })
        })

        await batch.commit()
        return responseDocRef
    }

    async pickRandomWinner(questionId: string): Promise<boolean> {
        const question = (await this.question(questionId).get()).data()
        let candidates = []
        let correctResponsesList

        try {
            if (!question) {
                throw Error(`Unable to get data for question: ${questionId}`)
            }

            switch (question.type) {
                case 'multiple-choice':
                    const correctAnswersList = await this.answers(questionId)
                        .where('correct', '==', true)
                        .get()
                    const correctAnswers = correctAnswersList.docs.map(
                        (doc) => doc.data().id
                    )
                    if (!correctAnswers || correctAnswers.length <= 0) {
                        break
                    }
                    correctResponsesList = await this.responses
                        .where('question', '==', questionId)
                        .where('selected', 'array-contains-any', correctAnswers)
                        .get()
                    candidates = correctResponsesList.docs.map(
                        (doc) => doc.data().personId
                    )
                    break
                case 'slider':
                    correctResponsesList = await this.responses
                        .where('question', '==', questionId)
                        .where(
                            'selected',
                            'array-contains',
                            question.slider.correct || 0
                        )
                        .get()
                    if (correctResponsesList.docs.length !== 0) {
                        candidates = correctResponsesList.docs.map(
                            (doc) => doc.data().personId
                        )
                        break
                    }
                    candidates = (
                        await this.responses
                        .where('question', '==', questionId)
                        .get()
                    ).docs.map((doc) => doc.data().personId)
                    break
                default:
                    break
            }

            if (candidates.length === 0) {
                return false
            }

            const i = Math.floor(Math.random() * candidates.length)
            const winnerPersonId = candidates[i] as number
            const winner = this.userModel.userRef(winnerPersonId.toString())
            await this.question(questionId).update({ winner }) // TODO: What's going on here?
        } catch (e) {
            log.error(e)
            return false;
        }
        return true
    }

    async updatePollStats(currentQuestionId: string): Promise<any> {
        const { answers } = await this.loadPollData()

        const allQaShards = await this.pollStats.get()
        const shards = allQaShards.docs
        if (shards.length === 0) {
            await this.pollSummary.set({})
            return {}
        }

        const total = {}
        const totalCorrect = {}
        const current = {}
        const currentTotal = {}
        let shardData = {}

        for (let i = 0; i < shards.length; i++) {
            shardData = shards[i].data()
            const [questionId, answerId] = shards[i].id.split('_')
            if (questionId === null || answerId === null) {
                log.error(`Shard '${shards[i].id}' has an error, skipping.`)
                continue
            }
            const answersForQuestion = answers[questionId]
            if (answersForQuestion === null) {
                log.error(`Shard '${shards[i].id}' has an error, skipping.`)
                continue
            }
            const answer = answersForQuestion.find((a) => a.id === answerId)
            if (answer === null) {
                log.error(`Shard '${shards[i].id}' has an error, skipping.`)
                continue
            }

            sumDeep(total, shardData)
            if (answer.data().correct === true) {
                sumDeep(totalCorrect, shardData)
            }

            if (questionId === currentQuestionId) {
                sumDeep(currentTotal, shardData)

                const answerWrapper: {
                    [i: string]: Record<string, unknown>
                } = {}
                answerWrapper[answerId] = shardData
                sumDeep(current, answerWrapper)
            }
        }
        const result = {
            total: {
                total: total,
                correct: totalCorrect,
            },
            currentQuestion: current,
            currentTotal: currentTotal,
        }
        await this.pollSummary.set(result)
        return result
    }

    async updateResponseStats(
        bucketPathsCommaSep: string,
        questionIdArray: string[]
    ): Promise<void> {
        const bucketPaths =
            typeof bucketPathsCommaSep === 'string'
                ? bucketPathsCommaSep.split(',')
                : []
        const result: {
            updatingQuestion: boolean
            bucketPaths: string[]
            questions: {
                [i: string]: {
                    status: string
                    responseCount: number
                    answers: {
                        [i: string]: Record<string, unknown>
                    }
                }
            }
        } = {
            updatingQuestion: true,
            bucketPaths: bucketPaths,
            questions: {},
        }

        await Promise.all(
            questionIdArray.map(async (currentQuestionId) => {
                const question = await this.question(currentQuestionId).get()

                if (!question.exists) {
                    log.error(`questionId '${currentQuestionId} does not exist`)
                } else {
                    const answerList = await this.answers(
                        currentQuestionId
                    ).get()
                    const answers = answerList.docs.map((doc) => doc.data())

                    result.questions[currentQuestionId] = {
                        status: 'calculating',
                        responseCount: 0,
                        answers: {},
                    }

                    answers.forEach((answerRef) => {
                        const answerValues = {
                            dimensions: bucketPaths.map((bucketPath) => {
                                return {
                                    path: bucketPath,
                                    buckets: {},
                                }
                            }),
                        }
                        result.questions[currentQuestionId].answers[
                            answerRef.id as string
                        ] = answerValues
                    })
                }
            })
        )

        const responseList = await this.responses.get()
        const responses = responseList.docs.map((doc) => doc.data())

        await Promise.all(
            responses.map(async (response) => {
                // TODO: skip responses if question not in questionIdArray
                if (questionIdArray.includes(response.question)) {
                    const responseUser = await this.userModel
                        .userRef(response.personId)
                        .get()
                    if (responseUser.exists) {
                        bucketPaths.forEach((bucketPath, index) => {
                            const userBucketValue = _get(
                                responseUser.data(),
                                bucketPath
                            )
                            if (
                                userBucketValue != null &&
                                userBucketValue != ''
                            ) {
                                response.selected.forEach(
                                    (selectedAnswer: string) => {
                                        const path = `questions.${response.question}.answers.${selectedAnswer}.dimensions.${index}.buckets.${userBucketValue}`
                                        const currentBucketValue = _get(
                                            result,
                                            path
                                        )
                                        _set(
                                            result,
                                            path,
                                            !isNumber(currentBucketValue)
                                                ? 1
                                                : currentBucketValue + 1
                                        )
                                    }
                                )
                            }
                        })
                    }
                }
            })
        )
        await this.responseStats.set(result)
    }

    constructor(
        firestore: firestore.Firestore,
        event: firestore.DocumentReference
    ) {
        super(event)
        this.userModel = new UserModel(firestore)
        this.db = firestore

        this.gameboardCol = this.event.collection(n.gameboard)
        this.gameboard = this.event.collection(n.gameboard).doc('current')

        this.questions = this.event.collection(n.questions)
        this.responses = this.event.collection(n.responses)
        this.responseStats = this.responses.doc('stats')

        this.pollStats = this.event.collection(n.pollStats)
        this.pollConfig = this.event.collection(n.gameboard).doc('pollConfig')
        this.pollSummary = this.gameboardCol.doc('pollSummary')
    }
}
