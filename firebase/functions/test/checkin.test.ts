import test from "ava"
import { checkinStateless } from "../src/handlers/checkin"
import { createResponse, createRequest } from "node-mocks-http";
import { generateConfig, generateEvent, generateUser, setEventInProgress, getAuthedFirestore  } from "./utils"
import { delay } from "../src/utils"

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
        await delay(1000)
    } catch(e) {
        t.pass(e);
    }

    t.true(res._isEndCalled())

    const data = (await db.doc(`events/${eventId}/counters/checkins`).get()).data()
    if (!data) {
        t.fail("Could not get event data")
        return;
    }

    t.is(data.count, 0)
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
    await delay(1000)

    t.true(res._isEndCalled())
    t.is(res.statusCode, 200)

    const data = (await db.doc(`events/${eventId}/counters/checkins`).get()).data()
    if (!data) {
        t.fail("Could not get event data")
        return;
    }

    t.is(data.count, 1)
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
    await delay(1000)

    t.true(res._isEndCalled())
    t.is(res.statusCode, 200)

    const data = (await db.doc(`events/${eventId}/counters/checkins`).get()).data()
    if (!data) {
        t.fail("Could not get event data")
        return;
    }

    t.is(data.count, 1)


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
    await delay(1000)

    t.true(res._isEndCalled())
    t.is(res.statusCode, 200)

    t.deepEqual(res._getJSONData(), {
      canCheckin: true,
      checkedIn: true,
      personId: parseInt(userId),
      firstName: 'Alient',
      lastName: 'Alieno',
      profilePicture: null,
      age: 62,
      linkedUsers: [],
    })

    const data = (await db.doc(`events/${eventId}/counters/checkins`).get()).data()
    if (!data) {
        t.fail("Could not get event data")
        return;
    }

    t.is(data.count, 1)
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
    await delay(1000)

    t.true(res._isEndCalled())
    t.is(res.statusCode, 200)

    const data = (await db.doc(`events/${eventId}/counters/checkins`).get()).data()
    if (!data) {
        t.fail("Could not get event data")
        return;
    }

    t.is(data.count, 1)
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
    await delay(1000)

    t.true(res._isEndCalled())
    t.is(res.statusCode, 401)

    const data = (await db.doc(`events/${eventId}/counters/checkins`).get()).data()
    if (!data) {
        t.fail("Could not get event data")
        return;
    }

    t.is(data.count, 0)
});

test("Stateless checkin validate counts", async t => {
    const db = getAuthedFirestore()
    await generateConfig(db);
    const userId = await generateUser(db);
    const userId2 = await generateUser(db);
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

    const req2= createRequest({
        headers: { 'x-api-token': "BLAH" },
        body: {
            personId: userId2,
        }
    })
    const res2 = createResponse()
    await checkinStateless(db, req2, res2, true)
    await delay(1000)

    t.true(res._isEndCalled())
    t.is(res.statusCode, 200)

    const data = (await db.doc(`events/${eventId}/counters/checkins`).get()).data()
    if (!data) {
        t.fail("Could not get counter")
        return;
    }

    t.is(data.count, 2)
});
