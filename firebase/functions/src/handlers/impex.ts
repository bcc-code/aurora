import { logger } from '../log'
import { Response, Request } from 'express'
import { firestore } from 'firebase-admin'
import { ParamsDictionary } from 'express-serve-static-core'
import { ExportRequest, ImportRequest } from '../types/impex'
import { EventModel } from '../model/event'
import { EventData, FeedConfig, StyleConfig } from '../types/event'
import { Bucket, File } from '@google-cloud/storage'
import {config} from '../utils'
import { DocumentSnapshot } from 'firebase-functions/lib/providers/firestore'
import {TemplatedString} from '../types/templated'

const log = logger('handler/impex');
const EXPORT_FORMAT_VERSION = "1";

interface value {
    id: string
    data: Record<string, unknown>,
    collections: Array<collection>,
}

interface collection {
    id: string,
    values: Array<value>
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
async function dumpCollection(col: firestore.CollectionReference) : Promise<collection> {
    const entries = await col.get();
    const out = {
        id: col.id,
        collections: [],
        values: [],
    } as collection;

    const promises = entries.docs.map(async e => {
        const val = {
            id: e.id,
            data: e.data()
        } as value

        const colls = await e.ref.listCollections()
        const exportedColls = colls.map(async c => await dumpCollection(c))
        val.collections = await Promise.all(exportedColls)
        out.values.push(val)
    })

    await Promise.all(promises)
    return out
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

    await storage.file(`${config.app.instance}/${exportName}/_VERSION`).save(EXPORT_FORMAT_VERSION)

    try {
        const event = new EventModel(db, eventId)

        const lb = await dumpCollection(event.eventRef.collection("liveboard"))
        await storage.file(`${config.app.instance}/${exportName}/liveboard.json`).save(JSON.stringify(lb))

        const ed = await exportEventData(event.eventRef)
        await storage.file(`${config.app.instance}/${exportName}/event.json`).save(JSON.stringify(ed))

        const dd = await dumpCollection(event.eventRef.collection("desk"))
        await storage.file(`${config.app.instance}/${exportName}/desk.json`).save(JSON.stringify(dd))

        const pgm = await dumpCollection(event.eventRef.collection("program"))
        await storage.file(`${config.app.instance}/${exportName}/program.json`).save(JSON.stringify(pgm))

        const screens = await dumpCollection(event.eventRef.collection("screens"))
        await storage.file(`${config.app.instance}/${exportName}/screens.json`).save(JSON.stringify(screens))

        const questions = await dumpCollection(event.eventRef.collection("questions"))
        await storage.file(`${config.app.instance}/${exportName}/questions.json`).save(JSON.stringify(questions))

        res.status(200).end();
        return
    } catch (e) {
        log.error(e)
    }

    res.status(500).end();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function importCollectionFromFile(
    storage: Bucket,
    filePath: string,
    parentDoc: firestore.DocumentReference,
    clearCollection: boolean,
    updateExisting = false,
) {
    const inFile = storage.file(filePath);
    if (!(await inFile.exists())) {
        return ["cant find desk import file"]
    }

    try {
        const f = await inFile.download()
        const data = JSON.parse(f.toString()) as collection
        await importIntoCollection(parentDoc, data, clearCollection, updateExisting)
    } catch (e) {
        console.dir(e);
        return [e as string]
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
        const data = JSON.parse(f.toString()) as EventData
        console.dir(await eventRef.ref.update(data))
    } catch (e) {
        console.dir(e);
        return [e as string]
    }

    return []
}

async function importIntoCollection(
    parentDoc: firestore.DocumentReference,
    data: collection,
    clearCollection: boolean,
    updateExisting = false,
) : Promise<string[]> {
    const collection  = parentDoc.collection(data.id)
    if (clearCollection) {
        const promises = (await collection.listDocuments()).map(x => x.delete())
        await Promise.all(promises)
    }

    const docsImport : Array<Promise<firestore.WriteResult>> = []
    const collsImport : Array<Promise<string[]>> = []
    for (const element of data.values) {
        let doc = null;

        const id = element.id;

        if (updateExisting && id) {
            doc = collection.doc(id)
        } else {
            doc = collection.doc()
        }

        docsImport.push(doc.set(element.data))

        for (const c of element.collections) {
            collsImport.push(importIntoCollection(doc, c, clearCollection, updateExisting))
        }
    }
    await Promise.all(docsImport)
    return (await Promise.all(collsImport)).reduce((acc, val) => acc.concat(val), []); // Flatten array
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


    const exportVersion = (await storage.file(`${importBasePath}/_VERSION`).download()).toString()
    if (exportVersion !== EXPORT_FORMAT_VERSION) {
        res.status(400).json({
            "message": `specified export is in a wrong format. Accepted ${EXPORT_FORMAT_VERSION} given ${exportVersion}`,
        }).end()
    }

    const errors : Array<string> = []

    if (req.body.liveboard) {
        await importCollectionFromFile(storage, `${importBasePath}/liveboard.json`, eventRef.ref, req.body.clearLiveboard ?? false)
    }

    if (req.body.eventData) {
        errors.push(...(await importEventData(storage, importBasePath, eventRef)))
    }

    if (req.body.desk) {
        await importCollectionFromFile(storage, `${importBasePath}/desk.json`, eventRef.ref, req.body.clearDesk ?? false)
    }

    if (req.body.program) {
        await importCollectionFromFile(storage, `${importBasePath}/program.json`, eventRef.ref, req.body.clearProgram ?? false)
    }

    if (req.body.screens) {
        await importCollectionFromFile(storage, `${importBasePath}/screens.json`, eventRef.ref, false, true)
    }

    if (req.body.gameboard) {
        await importCollectionFromFile(storage, `${importBasePath}/questions.json`, eventRef.ref, req.body.clearGameboard ?? false, true)
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
