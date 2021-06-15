import { logger } from '../log'
import { Response, Request } from 'express'
import { firestore } from 'firebase-admin'
import { ParamsDictionary } from 'express-serve-static-core'
import { ExportRequest, ImportRequest } from '../types/impex'
import { Liveboard, LiveboardExport } from '../types/liveboard'
import { EventModel } from '../model/event'
import { EventData, EventExport, FeedConfig, StyleConfig } from '../types/event'
import { Bucket, File } from '@google-cloud/storage'
import {config} from '../utils'
import { DocumentSnapshot } from 'firebase-functions/lib/providers/firestore'
import {TemplatedString} from '../types/templated'

const log = logger('handler/impex');

async function exportLiveboard(event : firestore.DocumentReference) : Promise<Liveboard[]> {
    const liveboardComponents = await event.collection("liveboard").get()
    return liveboardComponents.docs.map((c) => c.data() as Liveboard)
}

async function exportEventData(event : firestore.DocumentReference) : Promise<EventData> {
    const eventData  = (await event.get()).data()

    if (!eventData) {
        throw new Error("Cant get event data")
    }

    return {
        archived: eventData.archived as boolean,
        background: eventData.background as TemplatedString,
        banner: eventData.archived as string,
        canSendInquiries: eventData.canSendInquiries as boolean,
        details: eventData.details as string,
        feed: eventData.feed as FeedConfig,
        logo: eventData.logo as TemplatedString,
        name: eventData.name as string,
        style: eventData.style as StyleConfig,
        testimonyMaxDuration: eventData.testimonyMaxDuration as number,
        checkinFactor: eventData.checkinFactor as number,
        additionalCheckins: eventData.additionalCheckins as number,
    }

}

export async function exportData(
    db: firestore.Firestore,
    storage: Bucket,
    req: Request<ParamsDictionary, ExportRequest, ExportRequest, qs.ParsedQs>,
    res: Response,
) : Promise<void> {
    const exportName = (new Date()).toISOString() + "-" + (req.body.exportName ?? "");
    const eventId = req.body.eventId ?? "";
    if (!eventId) {
        res.status(400).json({
            "message": "eventId is required",
        }).end()
        return
    }


    try {
        const event = new EventModel(db, eventId)

        if (req.body.liveboard) {
            const exp = {
                liveboard: await exportLiveboard(event.eventRef),
            }
            await storage.file(`${config.app.instance}/${exportName}/liveboard.json`).save(JSON.stringify(exp))
        }

        if (req.body.eventData) {
            const exp = {
                event: await exportEventData(event.eventRef),
            }
            await storage.file(`${config.app.instance}/${exportName}/event.json`).save(JSON.stringify(exp))
        }

        res.status(200).end();
        return
    } catch (e) {
        log.error(e)
    }

    res.status(500).end();
}

async function importLiveboard(
    storage: Bucket,
    basePath: string,
    eventRef: DocumentSnapshot,
    clearLiveboard: boolean,
)  : Promise<string[]>{

    const inFile = storage.file(`${basePath}/liveboard.json`)

    if (!(await inFile.exists())) {
        return ["cant find liveboard import file"]
    }

    try {
        const f = await inFile.download()
        const data = JSON.parse(f.toString()) as LiveboardExport
        const liveboardColl = eventRef.ref.collection("liveboard")

        if (clearLiveboard) {
            const promises = (await liveboardColl.listDocuments()).map(x => x.delete())
            await Promise.all(promises)
        }

        const promises : Array<Promise<firestore.WriteResult>> = []
        for (const element of data.liveboard) {
            promises.push(liveboardColl.doc().set(element))
        }
        await Promise.all(promises)
    } catch (e) {
        console.dir(e);
    }


    return []
}

async function importEventData(
    storage: Bucket,
    basePath: string,
    eventRef: DocumentSnapshot,
)  : Promise<string[]>{

    const inFile = storage.file(`${basePath}/event.json`)

    if (!(await inFile.exists())) {
        return ["cant find event import file"]
    }

    try {
        const f = await inFile.download()
        const data = JSON.parse(f.toString()) as EventExport
        console.dir(await eventRef.ref.update(data.event))
    } catch (e) {
        console.dir(e);
    }


    return []
}


export async function importData(
    db: firestore.Firestore,
    storage: Bucket,
    req: Request<ParamsDictionary, ImportRequest, ImportRequest, qs.ParsedQs>,
    res: Response,
) : Promise<void> {
    const eventId = req.body.eventId ?? "";
    if (!eventId) {
        res.status(400).json({
            "message": "eventId is required",
        }).end()
        return
    }

    const importBasePath = req.body.importFrom ?? ""
    if (!importBasePath) {
        res.status(400).json({
            "message": "you need to specify the path",
        }).end()
        return
    }

    const eventRef = await db.collection("events").doc(eventId).get()
    if (!eventRef.exists) {
        res.status(404).json({
            "message": `eventId ${eventId} not found`,
        }).end()
        return
    }



    const errors : Array<string> = []

    if (req.body.liveboard) {
        errors.push(...(await importLiveboard(storage, importBasePath, eventRef, req.body.clearLiveboard ?? false)))
    }

    if (req.body.eventData) {
        errors.push(...(await importEventData(storage, importBasePath, eventRef)))
    }

    if (errors.length > 0) {
        return res.status(500).json({errors}).end();
    }

    return res.end()
}

export async function listExports (
    db: firestore.Firestore,
    storage: Bucket,
    req: Request,
    res: Response,
) : Promise<void> {
    const files = await storage.getFiles()
    const exportNames = new Set<string>()
    files[0].forEach((f : File) => {
        exportNames.add(f.name.split("/").slice(0,2).join("/"))
    });

    return res.json({ exportNames: Array.from(exportNames) }).end()
}
