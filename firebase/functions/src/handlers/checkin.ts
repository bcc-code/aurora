import { firestore } from 'firebase-admin'
import { Request, Response } from 'express'
import { EventModel } from '../model/event'
import { getPersonId } from '../model/utils'
import { ParamsDictionary } from 'express-serve-static-core'
import { logger } from '../log'
import NodeCache from "node-cache";

const log = logger('checkinHandler')

const checkinCache = new NodeCache( { stdTTL: 300, checkperiod: 60 } );
const EVENTID = "eventID";
const NO_EVENT = "-NONE-";

export async function checkinStatus(
    db: firestore.Firestore,
    req: Request,
    res: Response
): Promise<void> {
    const eventModel = new EventModel(db, req.query.eventId as string)
    const result = await eventModel.checkin.getCheckinStatus(getPersonId(req))
    res.json(result).end()
}

export async function userCount(
    db: firestore.Firestore,
    req: Request,
    res: Response
): Promise<void> {
    const { eventId } = req.query
    const eventModel = new EventModel(db, eventId as string)
    const result = await eventModel.checkin.updateCheckinCount()
    res.status(200).send(result).end()
}

export async function checkin(
    db: firestore.Firestore,
    req: Request<ParamsDictionary, ParamsDictionary, ParamsDictionary, qs.ParsedQs>,
    res: Response
): Promise<void> {
    const personId = getPersonId(req)
    const eventId = req.query.eventId as string || req.body.eventId
    const eventModel = new EventModel(db, eventId)
    await eventModel.checkin.checkin(personId)
    const updatedStatus = await eventModel.checkin.getCheckinStatus(personId)
    res.json(updatedStatus).end()
}

export async function checkinStateless(
    db: firestore.Firestore,
    req: Request<ParamsDictionary, ParamsDictionary, ParamsDictionary, qs.ParsedQs>,
    res: Response,
    disableCache = false, // This is needed for testing
) : Promise<void> {
    let personId : string|null = null

    if (req.header('x-api-token')) {
        personId = req.body.personId ?? null;
    } else  {
        try {
            personId = getPersonId(req)
        } catch(e) {
            // Person ID is null so we will return 401
            log.warn("checkinStateless", e)
        }
    }

    if (!personId) {
        res.status(401).end()
       return
    }

    let eventId : string | undefined = checkinCache.get(EVENTID)
    if (!eventId || disableCache) {
        const config = (await db.collection('/configs').doc('brunstadtv-app').get()).data()
        if (!config) {
            res.status(500).end()
            return
        }

        const currentEvent = config.currentEventPath as firestore.DocumentReference
        if (currentEvent) {
            eventId = currentEvent.id;
        } else {
            eventId = NO_EVENT
        }

        checkinCache.set(EVENTID, eventId)
    }

    if (eventId === NO_EVENT) {
        res.status(204).end()
        return
    }

    const q = req.query as Record<string,string|undefined>
    const platform = q["platform"] ?? "NONE"

    const eventModel = new EventModel(db, eventId);
    await eventModel.checkin.checkin(personId, platform)
    const updatedStatus = await eventModel.checkin.getCheckinStatus(personId)
    res.json(updatedStatus).end()
}
