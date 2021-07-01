import test from "ava"
import { firestore, initializeApp } from "firebase-admin"
import { checkinStateless } from "../src/handlers/checkin"
import { createResponse, createRequest } from "node-mocks-http";
import { randomBytes } from "crypto";
import { generateConfig, generateEvent, generateUser, setEventInProgress } from "./utils"

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

test("Stateless checkin, event, bad user", async t => {
    const db = getAuthedFirestore()
    await generateConfig(db);
    const eventId = await generateEvent(db);
    await setEventInProgress(db, eventId)

    const req = createRequest(
        {
            user,
        }
    )
    const res = createResponse()
    try {
        await checkinStateless(db, req, res, true)
    } catch(e) {
        t.pass(e);
    }

    t.true(res._isEndCalled())

    const data = (await db.collection("events").doc(eventId).get()).data()
    if (!data) {
        t.fail("Could not get event data")
        return;
    }

    t.is(data.checkedInUsers, 0)
});

test("Stateless checkin, event", async t => {
    const db = getAuthedFirestore()
    await generateConfig(db);
    const userId = await generateUser(db);
    const eventId = await generateEvent(db);
    await setEventInProgress(db, eventId)

    const req = createRequest(
        {
            user: { 'https://login.bcc.no/claims/personId': parseInt(userId) }
        }
    )
    const res = createResponse()
    await checkinStateless(db, req, res, true)

    t.true(res._isEndCalled())
    t.is(res.statusCode, 200)

    const data = (await db.collection("events").doc(eventId).get()).data()
    if (!data) {
        t.fail("Could not get event data")
        return;
    }

    t.is(data.checkedInUsers, 1)
});
