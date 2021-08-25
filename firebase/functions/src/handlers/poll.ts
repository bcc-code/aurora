import { EventModel } from '../model/event'
import { UserModel } from '../model/user'
import { logger } from '../log'
import { ParamsDictionary } from 'express-serve-static-core'
import { firestore } from 'firebase-admin'
import { Request, Response } from 'express'
import { getPersonId } from '../model/utils'
import { IUser } from '../types/user'

const log = logger('pollHandler')

interface submitPollResponseReq {
    eventId: string,
    startAfter: string,
    limit: string,
    answeringPersonId?: string,
}

export async function submitPollResponse(
    db: firestore.Firestore,
    req: Request<ParamsDictionary, ParamsDictionary, ParamsDictionary, submitPollResponseReq>,
    res: Response
): Promise<void> {
    log.debug("submitPollResponse")
    const eventModel = new EventModel(db, req.query.eventId)
    const userModel = new UserModel(db)

    const authPersonId = getPersonId(req)
    if (!authPersonId) {
        return res.status(401).end()
    }

    let answeringPersonId = authPersonId;
    if (req.query.answeringPersonId) {
        answeringPersonId = req.query.answeringPersonId
    }

    const userDoc = await userModel.userRef(answeringPersonId).get()
    const userData = userDoc.data() as IUser|null

    if (!userData) {
        return res.status(404).json({"message": "user not found"}).end()
    }

    // Is Person answering for themselves?
    if (answeringPersonId !== authPersonId) {
        // Check if the person has permisson to answer on behalf of the other person
        const g1 = (userData.guardian1Id ?? -1).toFixed();
        const g2 = (userData.guardian2Id ?? -1).toFixed();

        // Neither of the guardians is the authenticated person
        if (g1 !== authPersonId && g2 !== authPersonId) {
            return res.status(403).end()
        }
    }

    try {
        log.debug(`Recording answer for answeringPersonId: ${answeringPersonId}, authPersonId: ${authPersonId}`);
        await eventModel.poll.setPollResponse(
            userDoc,
            req.body.questionId,
            req.body.selectedAnswers as unknown as string[],
        )
    } catch (err) {
        log.error(err)
        res.sendStatus(400).end()
        return
    }
    return res.sendStatus(200).end()
}

export async function pickWinner(
    db: firestore.Firestore,
    req: Request<ParamsDictionary, ParamsDictionary, ParamsDictionary, qs.ParsedQs>,
    res: Response
): Promise<void> {
    log.debug("pickWinner")
    const eventModel = new EventModel(db, req.query.eventId as string)
    const result = await eventModel.poll.pickRandomWinner(req.query.questionId as string)
    return res.json(result).end()
}

export async function updatePollStats(
    db: firestore.Firestore,
    req: Request,
    res: Response
): Promise<void> {
    log.debug("updatePollStats")
    if (req.query.questionId === null) {
        return res
            .status(400)
            .send({ message: "Required parameter 'questionId' not specified." })
            .end()
    }

    const eventModel = new EventModel(db, req.query.eventId as string)
    console.log(eventModel.eventRef.id);
    const result = await eventModel.poll.updatePollStats(req.query.questionId as string)
    return res.json(result).end()
}

export async function startPoll(
    db: firestore.Firestore,
    req: Request<ParamsDictionary, ParamsDictionary, ParamsDictionary, qs.ParsedQs>,
    res: Response
): Promise<void> {
    log.debug("startPoll")
    if (req.body.questionIds === null) {
        return res
            .status(400)
            .send({
                message: "Required parameter 'questionIds' not specified.",
            })
            .end()
    }
    const eventModel = new EventModel(db, req.query.eventId as string)
    const result = await eventModel.poll.startPolls(req.body.questionIds as unknown as string[])
    return res.json(result).end()
}

export async function pollClearAll(
    db: firestore.Firestore,
    req: Request,
    res: Response
): Promise<void> {
    log.debug("pollClearAll")
    const eventModel = new EventModel(db, req.query.eventId as string)
    const result = await eventModel.poll.pollClearAll()
    return res.json(result).end()
}
