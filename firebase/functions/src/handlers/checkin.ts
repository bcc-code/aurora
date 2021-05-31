import { firestore } from 'firebase-admin'
import { Request, Response } from 'express'
import { EventModel } from '../model/event'
import { getPersonId } from '../model/utils'
import NodeCache from "node-cache";

const checkinCache = new NodeCache( { stdTTL: 300, checkperiod: 60 } );
const EVENTID = "eventID";

export async function checkinStatus(
    db: firestore.Firestore,
    req: Request,
    res: Response
): Promise<void> {
    const eventModel = new EventModel(db, req.query.eventId)
    const result = await eventModel.checkin.getCheckinStatus(getPersonId(req))
    res.json(result).end()
}

export async function userCount(
    db: firestore.Firestore,
    req: Request,
    res: Response
): Promise<void> {
    const { eventId } = req.query
    const eventModel = new EventModel(db, eventId)
    const result = await eventModel.checkin.updateCheckinCount()
    res.status(200).send(result).end()
}

export async function checkin(
    db: firestore.Firestore,
    req: Request,
    res: Response
): Promise<void> {
    const personId = getPersonId(req)
    const eventId = req.query.eventId as string || req.body.eventId as string
    const eventModel = new EventModel(db, eventId)
    await eventModel.checkin.checkin(personId, [personId])
    const updatedStatus = await eventModel.checkin.getCheckinStatus(personId)
    return res.json(updatedStatus).end()
}

export async function checkinStateless(
    db: firestore.Firestore,
    req: Request,
    res: Response,
) : Promise<void> {
    const personId = getPersonId(req)
    if (!personId) {
        return res.status(401).end()
    }

    let eventId : string | undefined = checkinCache.get(EVENTID)
    if (!eventId) {
        const config = (await db.collection('/configs').doc('brunstadtv-app').get()).data()
        if (!config) {
            return res.status(500).end()
        }

        const currentEvent = config.currentEventPath as firestore.DocumentReference
        eventId = currentEvent.id;
        checkinCache.set(EVENTID, eventId)
    }

    const q = req.query as Record<string,string|undefined>
    const platform = q["platform"] ?? "NONE"

    const eventModel = new EventModel(db, eventId);
    await eventModel.checkin.checkin(personId, [personId], platform)
    const updatedStatus = await eventModel.checkin.getCheckinStatus(personId)
    return res.json(updatedStatus).end()
}
