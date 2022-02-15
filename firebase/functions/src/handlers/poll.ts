import { EventModel } from '../model/event'
import { UserModel } from '../model/user'
import { logger } from '../log'
import { ParamsDictionary } from 'express-serve-static-core'
import { firestore } from 'firebase-admin'
import { Request, Response } from 'express'
import { getPersonId } from '../model/utils'
import { IUser } from '../types/user'

const log = logger('pollHandler')

interface submitPollBody {
    questionId: string,
    selectedAnswers: string[],
}

export async function submitPollResponse(
    db: firestore.Firestore,
    req: Request,
    res: Response,
): Promise<void> {
    log.debug("submitPollResponse")
    if (!req.query.eventId) {
        res.status(404).json({"message": "missing event id"}).end()
        return
    }

    let authPersonId : string
    try {
        authPersonId =  getPersonId(req)
    } catch(e) {
        console.warn(e)
        res.status(401).end()
        return
    }

    const body = req.body as submitPollBody;
    if (!body.questionId || !body.selectedAnswers) {
        res.json({"message": "Missing questionId or selectedAnswers"})
            .status(400).end()
        return
    }

    const eventModel = new EventModel(db, req.query.eventId as string)
    const userModel = new UserModel(db)

    let answeringPersonId = authPersonId;
    if (req.query.answeringPersonId) {
        answeringPersonId = req.query.answeringPersonId as string
    }

    const userDoc = await userModel.userRef(answeringPersonId).get()
    const userData = userDoc.data() as IUser|null

    if (!userData) {
        res.status(404).json({"message": "user not found"}).end()
        return
    }

    // Is Person answering for themselves?
    if (answeringPersonId !== authPersonId) {
        // Check if the person has permisson to answer on behalf of the other person
        const g1 = (userData.Guardian1Id ?? -1).toFixed();
        const g2 = (userData.Guardian2Id ?? -1).toFixed();

        // Neither of the guardians is the authenticated person
        if (g1 !== authPersonId && g2 !== authPersonId) {
            res.status(403).end()
            return
        }
    }


    try {
        log.debug(`Recording answer for answeringPersonId: ${answeringPersonId}, authPersonId: ${authPersonId}`);
        await eventModel.poll.setPollResponse(
            userDoc,
            body.questionId,
            body.selectedAnswers,
        )
    } catch (err) {
        log.error(err)
        res.sendStatus(400).end()
        return
    }

    res.sendStatus(200).end()
}

export async function pickWinner(
    db: firestore.Firestore,
    req: Request<ParamsDictionary, ParamsDictionary, ParamsDictionary, qs.ParsedQs>,
    res: Response
): Promise<void> {
    log.debug("pickWinner")
    const eventModel = new EventModel(db, req.query.eventId as string)
    const result = await eventModel.poll.pickRandomWinner(req.query.questionId as string)
    res.json(result).end()
    return
}

export async function updatePollStats(
    db: firestore.Firestore,
    req: Request,
    res: Response
): Promise<void> {
    log.debug("updatePollStats")
    if (req.query.questionId === null) {
        res
            .status(400)
            .send({ message: "Required parameter 'questionId' not specified." })
            .end()
        return
    }

    const eventModel = new EventModel(db, req.query.eventId as string)
    console.log(eventModel.eventRef.id);
    const result = await eventModel.poll.updatePollStats(req.query.questionId as string)
    res.json(result).end()
}

export async function startPoll(
    db: firestore.Firestore,
    req: Request<ParamsDictionary, ParamsDictionary, ParamsDictionary, qs.ParsedQs>,
    res: Response
): Promise<void> {
    log.debug("startPoll")
    if (req.body.questionIds === null) {
        res
            .status(400)
            .send({
                message: "Required parameter 'questionIds' not specified.",
            })
            .end()
        return
    }
    const eventModel = new EventModel(db, req.query.eventId as string)
    const result = await eventModel.poll.startPolls(req.body.questionIds as unknown as string[])
    res.json(result).end()
}

export async function pollClearAll(
    db: firestore.Firestore,
    req: Request,
    res: Response
): Promise<void> {
    log.debug("pollClearAll")
    const eventModel = new EventModel(db, req.query.eventId as string)
    const result = await eventModel.poll.pollClearAll()
    res.json(result).end()
}
