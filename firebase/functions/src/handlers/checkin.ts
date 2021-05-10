import { firestore } from 'firebase-admin'
import { Request, Response } from 'express'
import { EventModel } from '../model/event'
import { getPersonId } from '../model/utils'

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
    const eventId = req.query.eventId || req.body.eventId
    const eventModel = new EventModel(db, eventId)
    await eventModel.checkin.checkin(personId, [personId])
    const updatedStatus = await eventModel.checkin.getCheckinStatus(personId)
    return res.json(updatedStatus).end()
}
