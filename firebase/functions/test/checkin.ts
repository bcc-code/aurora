import test from "ava"
import { firestore, initializeApp } from "firebase-admin"
import { checkinStateless } from "../src/handlers/checkin"
import { createResponse, createRequest } from "node-mocks-http";
import { randomBytes } from "crypto";

function getAuthedFirestore() {
    const id = randomBytes(20).toString('hex')
    const app = initializeApp({}, id)
    return firestore(app)
}

const user = { 'https://login.bcc.no/claims/personId': '123' }

test("Stateless checkin, no config", async t => {
    const db = getAuthedFirestore()
    const req = createRequest(
        {
            user,
        }
    )
    const res = createResponse()
    await checkinStateless(db, req, res)

    t.true(res._isEndCalled())
    t.is(res.statusCode, 500)
});

async function generateConfig(db : firestore.Firestore) {
    await db.collection('configs').doc('brunstadtv-app').set({
        canCheckin: true,
        currentCompetition: null,
        isLiveOnline: true,
        minAppVersion: "1.0",
        showMaintenanceMessage: false,
    });
}

test("Stateless checkin, no event", async t => {
    const db = getAuthedFirestore()
    await generateConfig(db);
    const req = createRequest(
        {
            user,
        }
    )
    const res = createResponse()
    await checkinStateless(db, req, res)

    t.true(res._isEndCalled())
    t.is(res.statusCode, 204)
});
