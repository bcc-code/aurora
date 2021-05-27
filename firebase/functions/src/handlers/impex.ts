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
    db: firestore.Firestore,
    storage: Bucket,
    req: Request<ParamsDictionary, ExportRequest, ExportRequest, qs.ParsedQs>,
    res: Response,
) : Promise<void> {
    console.log(req.body);
    const eventId = req.body.eventId ?? "";
    if (!eventId) {
        res.status(400).json({
            "message": "eventId is required",
        }).end()
        return
    }


    try {
        const event = new EventModel(db, eventId)

        const exp = {
            liveboard: await exportLiveboard(event.eventRef),
        }
        await storage.file("env/text.json").save(JSON.stringify(exp))
    } catch (e) {
        log.error(e)
    }

    res.status(200).json(exp).end();
}
