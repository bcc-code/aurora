import { firestore, initializeApp } from "firebase-admin"
import { randomBytes } from "crypto";

export function getAuthedFirestore() : FirebaseFirestore.Firestore {
    const appId = randomBytes(20).toString('hex')
    const projectId = randomBytes(20).toString('hex')
    const app = initializeApp({projectId}, appId)
    return firestore(app)
}


export async function generateConfig(db : firestore.Firestore) : Promise<void> {
    await db.collection('configs').doc('brunstadtv-app').set({
        canCheckin: true,
        currentCompetition: null,
        isLiveOnline: true,
        minAppVersion: "1.0",
        showMaintenanceMessage: false,
    });
}

function NewEvent(name: string, order: number)  {
    return {
        name: name,
        order: order,
        details: "",
        archived: false,
        banner: "",
        testimonyMaxDurationSeconds: 60,
        currentProgramElement: null,
        isActive: false,
        checkedInUsers: 0,
        canSendInquiries: false,
        feed: {
            autoPush: false,
            frequency: 5
        },
        logo: {
            useTemplate: true,
            value: null,
            computedValue: null
        },
        background: {
            useTemplate: true,
            value: null,
            computedValue: null
        },
        style: {
            logo: {
                useTemplate: true,
                value: null,
                computedValue: null
            },
            primaryColor: {
                useTemplate: true,
                value: null,
                computedValue: null
            },
            primaryColorDark: {
                useTemplate: true,
                value: null,
                computedValue: null
            }
        }
    }
}

function randInt() : number {
    return Math.floor(Math.random() * 10000)
}

function NewUser(id : number, parentId : number|null) {
    return {
        Birthdate: "1960-03-10T00:00:00",
        ChurchId: 9999,
        ChurchName: "New Mars",
        CountryName: "New Center",
        DisplayName: "Alien Alieno",
        FirstName: "Alient",
        GenderId: 1,
        Guardian1Id: parentId ?? id,
        Guardian2Id: 0,
        HasMembership: true,
        LastName: "Alieno",
        LinkedUserIds: [],
        PersonId: id,
        UserGroupId: "bcc",
    }
}

function NewMultipleChoiceQuestion(id : number, allowChanges: boolean) {
    return {
        canChangeAnswer: allowChanges,
        defaultAnswer: null,
        defaultAnswerId: null,
        id: id.toFixed(),
        initialized: true,
        order: 6,
        slider: {},
        texts: {
            "no": "Cillum nulla Lorem consectetur ad et fugiat consectetur aliquip sint sit laborum. Nostrud magna nostrud commodo nisi quis occaecat in esse est reprehenderit."
        },
        type: "multiple-choice"
    }
}

export async function generateUser(db : firestore.Firestore, parentId: number|null = null) : Promise<string> {
    const id = randInt()
    const userDoc = db.collection("users").doc(id.toFixed());
    await userDoc.set(NewUser(id, parentId))
    return id.toFixed()
}

export async function generateEvent(db : firestore.Firestore) : Promise<string> {
    const id = randomBytes(20).toString('hex')
    const event = db.collection("events").doc(id)
    await event.collection("counters").doc("checkins").set({
            count: 0,
            lastCountUpdate: Date.now(),
            updatePending: false,
    })
    await event.set(NewEvent("Event", 1))
    return id;
}

export async function setEventInProgress(db : firestore.Firestore, eventId : string) : Promise<void> {
    const config = db.collection("configs").doc("brunstadtv-app")
    const event = await db.collection("events").doc(eventId).get()
    await config.update({ currentEventPath: event.ref })
}

export async function generateMultipleChoiceQuestion(db : firestore.Firestore, eventId: string, allowChanges = false) : Promise<string> {
    const id = randInt()
    const questionDoc = db.collection(`events/${eventId}/questions`).doc(id.toFixed());
    const q = NewMultipleChoiceQuestion(id, allowChanges)
    await questionDoc.set(q)
    return id.toFixed()
}
