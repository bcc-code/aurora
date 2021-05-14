import { logger } from '../log'
import { Response, Request } from 'express'
import { firestore } from 'firebase-admin'
import { ParamsDictionary } from 'express-serve-static-core'
import { ExportRequest } from '../types/impex'
import { Liveboard } from '../types/liveboard'
import { EventModel } from '../model/event'
import { Bucket } from '@google-cloud/storage'

const log = logger('handler/impex');

async function exportLiveboard(event : firestore.DocumentReference) : Promise<Liveboard[]> {
    const liveboardComponents = await event.collection("liveboard").get()
    return liveboardComponents.docs.map((c) => c.data() as Liveboard)
}

export async function exportData(
    storage: Bucket,
    db: firestore.Firestore,
    req: Request<ParamsDictionary, ExportRequest, ExportRequest, qs.ParsedQs>,
    res: Response,
) : Promise<void> {
    const eventId = req.body.eventId ?? "";
    if (!eventId) {
        res.status(400).json({
            "message": "eventId is required",
        })
    }

    const event = new EventModel(db, eventId)

    const exp = {
        liveboard: await exportLiveboard(event.eventRef),
    }

    res.status(200).json(exp).end();
}
