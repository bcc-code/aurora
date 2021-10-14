import { firestore } from "firebase-admin"
import { randomBytes } from "crypto";

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

function NewUser(id : number) {
    return {
        Birthdate: "1960-03-10T00:00:00",
        ChurchId: 9999,
        ChurchName: "New Mars",
        CountryName: "New Center",
        DisplayName: "Alien Alieno",
        FirstName: "Alient",
        GenderId: 1,
        Guardian1Id: id,
        Guardian2Id: 0,
        HasMembership: true,
        LastName: "Alieno",
        LinkedUserIds: [],
        PersonId: id,
        UserGroupId: "bcc",
    }
}

export async function generateUser(db : firestore.Firestore) : Promise<string> {
    const id = randInt()
    const userDoc = db.collection("users").doc(id.toFixed());
    await userDoc.set(NewUser(id))
    return id.toFixed()
}

export async function generateEvent(db : firestore.Firestore) : Promise<string> {
    const id = randomBytes(20).toString('hex')
    const event = db.collection("events").doc(id)
    await event.set(NewEvent("Event", 1))
    return id;
}

export async function setEventInProgress(db : firestore.Firestore, eventId : string) : Promise<void> {
    const config = db.collection("configs").doc("brunstadtv-app")
    const event = await db.collection("events").doc(eventId).get()
    await config.update({ currentEventPath: event.ref })
}
