import { firestore } from 'firebase-admin'
import { Request, Response } from 'express'
import { EventModel } from '../model/event'
import { ParamsDictionary } from 'express-serve-static-core'
import * as NodeCache from "node-cache";

const eventsCache = new NodeCache( { stdTTL: 10, checkperiod: 1 } ) as NodeCache;

interface EventDataRequest {
    eventId?: string
}

class TemplatedValue<T> {
    computedValue?: T
    useTemplate = false
    value?: T
}

export async function eventList(
    db: firestore.Firestore,
    req: Request,
    res: Response,
): Promise<void> {
    const events = await db.collection("events")
                            .where("archived", "==", false)
                            .orderBy("order")
                            .select("id", "name", "order")
                            .get()
    res.json(events.docs.map(x => {
        const out = x.data();
        out.id = x.id;
        return out;
    }))
}

export async function getEventData(
    db: firestore.Firestore,
    req: Request<ParamsDictionary, EventDataRequest, EventDataRequest, EventDataRequest>,
    res: Response,
) : Promise<void> {
    const eventId = req.query.eventId ?? ""
    if (!eventId) {
        res.status(400).json({"message": "eventId is required"}).end();
        return
    }

    if (eventsCache.has(eventId)) {
        res.json(eventsCache.get(eventId)).end()
        return
    }

    const event = new EventModel(db, eventId)
    const eventData = (await event.eventRef.get()).data()
    if (!eventData) {
        res.status(500).json({"message": "could not load data"}).end();
        return
    }

    const logo = eventData.logo as TemplatedValue<string>
    const data = {
        id: eventId,
        name: eventData.name as string ?? "",

        // TODO: Placeholders
        logo: logo.computedValue,
        banner: eventData.banner as (string | undefined),
    }

    eventsCache.set(eventId, data)

    res.json(data);
}
