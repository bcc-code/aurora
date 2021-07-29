import test from "ava"
import { firestore, initializeApp } from "firebase-admin"
import { checkinStateless } from "../src/handlers/checkin"
import { createResponse, createRequest } from "node-mocks-http";
import { randomBytes } from "crypto";
import { generateConfig, generateEvent, generateUser, setEventInProgress } from "./utils"
/*
function getAuthedFirestore() {
    const appId = randomBytes(20).toString('hex')
    const projectId = randomBytes(20).toString('hex')
    const app = initializeApp({projectId}, appId)
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

test("Stateless checkin, event, custom agent", async t => {
    const db = getAuthedFirestore()
    await generateConfig(db);
    const userId = await generateUser(db);
    const eventId = await generateEvent(db);
    await setEventInProgress(db, eventId)

    const req = createRequest(
        {
            user: { 'https://login.bcc.no/claims/personId': parseInt(userId) },
            query: {
                "platform": "TESTING",
            },
        },
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


    const ciData = (await db.collection(`events/${eventId}/checkins`).doc(userId).get()).data()
     if (!ciData) {
        t.fail("Could not get checkin data")
        return;
    }

    t.is(ciData.platform, "TESTING");
});

test("Stateless checkin, event, validate Status", async t => {
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

    t.deepEqual(res._getJSONData(), {
      canCheckin: true,
      checkedIn: true,
      personId: parseInt(userId),
      firstName: 'Alient',
      lastName: 'Alieno',
      profilePicture: null,
      age: 61,
      linkedUsers: [],
    })

    const data = (await db.collection("events").doc(eventId).get()).data()
    if (!data) {
        t.fail("Could not get event data")
        return;
    }

    t.is(data.checkedInUsers, 1)
});

test("Stateless checkin, event, API call", async t => {
    const db = getAuthedFirestore()
    await generateConfig(db);
    const userId = await generateUser(db);
    const eventId = await generateEvent(db);
    await setEventInProgress(db, eventId)

    const req = createRequest({
        headers: { 'x-api-token': "BLAH" },
        body: {
            personId: userId,
        }
    })
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

test("Stateless checkin, event, API call, no user", async t => {
    const db = getAuthedFirestore()
    await generateConfig(db);
    const eventId = await generateEvent(db);
    await setEventInProgress(db, eventId)

    const req = createRequest({
            headers: { 'x-api-token': "BLAH" },
    })
    const res = createResponse()
    await checkinStateless(db, req, res, true)

    t.true(res._isEndCalled())
    t.is(res.statusCode, 401)

    const data = (await db.collection("events").doc(eventId).get()).data()
    if (!data) {
        t.fail("Could not get event data")
        return;
    }

    t.is(data.checkedInUsers, 0)
});
*/
