import test from "ava"
import { createResponse, createRequest } from "node-mocks-http";
import { generateUser, generateEvent, generateMultipleChoiceQuestion, getAuthedFirestore  } from "./utils";
import { submitPollResponse } from "../src/handlers/poll";

const user = { 'https://login.bcc.no/claims/personId': '123' }

test("submitPollResponse with no user", async t => {
    const db = getAuthedFirestore()
    const event = generateEvent(db)
    const req = createRequest({
            query: {
                eventId: event,
            },
    })
    const res = createResponse()

    await submitPollResponse(db, req, res)
    t.true(res._isEndCalled())
    t.is(res.statusCode, 401)
})

test("submitPollResponse with no event given", async t => {
    const db = getAuthedFirestore()
    const req = createRequest(
        {
            user,
        }
    )
    const res = createResponse()
    await submitPollResponse(db, req, res)

    t.true(res._isEndCalled())
    t.is(res.statusCode, 404)
})

test("submitPollResponse with missing data", async t => {
    const db = getAuthedFirestore()
    const event = await generateEvent(db)

    const req = createRequest(
        {
            user,
            query: {
                eventId: event,
            },
        },
    )
    const res = createResponse()
    await submitPollResponse(db, req, res)

    t.true(res._isEndCalled())
    t.is(res.statusCode, 400)
    t.deepEqual(res._getJSONData(), {"message": "Missing questionId or selectedAnswers"})
})

test("submitPollResponse with no question in DB", async t => {
    // TODO: Should we check for the existance of a question.
    // Could data inserted in this way mess with some stats or something?

    const db = getAuthedFirestore()
    const event = await generateEvent(db)
    const u = await generateUser(db)

    const req = createRequest(
        {
            user: { 'https://login.bcc.no/claims/personId': u },
            query: {
                eventId: event,
            },
            body: {
                questionId: "123",
                selectedAnswers: ["1", "2"],
            }
        },
    )
    const res = createResponse()
    await submitPollResponse(db, req, res)

    t.true(res._isEndCalled())
    t.is(res.statusCode, 200)

    const response = await db.doc(`events/${event}/responses/${u}_123`).get()
    t.deepEqual(response.data()?.selected, ["1", "2"])
})

test("submitPollResponse with question but no answers in DB", async t => {
    // TODO: Should we check for the existance of a question.
    // Could data inserted in this way mess with some stats or something?

    const db = getAuthedFirestore()
    const event = await generateEvent(db)
    const u = await generateUser(db)
    const q = await generateMultipleChoiceQuestion(db, event)

    const req = createRequest(
        {
            user: { 'https://login.bcc.no/claims/personId': u },
            query: {
                eventId: event,
            },
            body: {
                questionId: q,
                selectedAnswers: ["1", "2"],
            }
        },
    )
    const res = createResponse()
    await submitPollResponse(db, req, res)

    t.true(res._isEndCalled())
    t.is(res.statusCode, 200)

    const response = await db.doc(`events/${event}/responses/${u}_${q}`).get()
    t.deepEqual(response.data()?.selected, ["1", "2"])
})

test("submitPollResponse double submission fail", async t => {
    // TODO: Should we check for the existance of a question.
    // Could data inserted in this way mess with some stats or something?

    const db = getAuthedFirestore()
    const event = await generateEvent(db)
    const u = await generateUser(db)
    const q = await generateMultipleChoiceQuestion(db, event)

    const req = createRequest(
        {
            user: { 'https://login.bcc.no/claims/personId': u },
            query: {
                eventId: event,
            },
            body: {
                questionId: q,
                selectedAnswers: ["1", "2"],
            }
        },
    )
    const res = createResponse()
    await submitPollResponse(db, req, res)

    t.true(res._isEndCalled())
    t.is(res.statusCode, 200)

    const response = await db.doc(`events/${event}/responses/${u}_${q}`).get()
    t.deepEqual(response.data()?.selected, ["1", "2"])

    const res2 = createResponse()
    await submitPollResponse(db, req, res2)
    t.true(res2._isEndCalled())
    t.is(res2.statusCode, 400)

})

test("submitPollResponse double submission ok", async t => {
    // TODO: Should we check for the existance of a question.
    // Could data inserted in this way mess with some stats or something?

    const db = getAuthedFirestore()
    const event = await generateEvent(db)
    const u = await generateUser(db)
    const q = await generateMultipleChoiceQuestion(db, event, true)

    const req = createRequest(
        {
            user: { 'https://login.bcc.no/claims/personId': u },
            query: {
                eventId: event,
            },
            body: {
                questionId: q,
                selectedAnswers: ["1", "2"],
            }
        },
    )
    const res = createResponse()
    await submitPollResponse(db, req, res)

    t.true(res._isEndCalled())
    t.is(res.statusCode, 200)

    const response = await db.doc(`events/${event}/responses/${u}_${q}`).get()
    t.deepEqual(response.data()?.selected, ["1", "2"])

    const req2 = createRequest(
        {
            user: { 'https://login.bcc.no/claims/personId': u },
            query: {
                eventId: event,
            },
            body: {
                questionId: q,
                selectedAnswers: ["612"],
            }
        },
    )
    const res2 = createResponse()
    await submitPollResponse(db, req2, res2)
    t.true(res2._isEndCalled())
    t.is(res2.statusCode, 200)

    const response2 = await db.doc(`events/${event}/responses/${u}_${q}`).get()
    t.deepEqual(response2.data()?.selected, ["612"])

})

test("submitPollResponse on Behalf fail", async t => {
    // TODO: Should we check for the existance of a question.
    // Could data inserted in this way mess with some stats or something?

    const db = getAuthedFirestore()
    const event = await generateEvent(db)
    const u = await generateUser(db)
    const q = await generateMultipleChoiceQuestion(db, event)

    const req = createRequest(
        {
            user: { 'https://login.bcc.no/claims/personId': u },
            query: {
                eventId: event,
                answeringPersonId: "123332",
            },
            body: {
                questionId: q,
                selectedAnswers: ["1", "2"],
            }
        },
    )
    const res = createResponse()
    await submitPollResponse(db, req, res)

    t.true(res._isEndCalled())
    t.is(res.statusCode, 404)
})

test("submitPollResponse on Behalf fail2", async t => {
    // TODO: Should we check for the existance of a question.
    // Could data inserted in this way mess with some stats or something?

    const db = getAuthedFirestore()
    const event = await generateEvent(db)
    const u = await generateUser(db)
    const u2 = await generateUser(db)
    const q = await generateMultipleChoiceQuestion(db, event)

    const req = createRequest(
        {
            user: { 'https://login.bcc.no/claims/personId': u },
            query: {
                eventId: event,
                answeringPersonId: u2,
            },
            body: {
                questionId: q,
                selectedAnswers: ["1", "2"],
            }
        },
    )
    const res = createResponse()
    await submitPollResponse(db, req, res)

    t.true(res._isEndCalled())
    t.is(res.statusCode, 403)
})

test("submitPollResponse on Behalf ok", async t => {
    // TODO: Should we check for the existance of a question.
    // Could data inserted in this way mess with some stats or something?

    const db = getAuthedFirestore()
    const event = await generateEvent(db)
    const u = await generateUser(db)
    const u2 = await generateUser(db, false, Number(u))
    const q = await generateMultipleChoiceQuestion(db, event)

    const req = createRequest(
        {
            user: { 'https://login.bcc.no/claims/personId': u },
            query: {
                eventId: event,
                answeringPersonId: u2,
            },
            body: {
                questionId: q,
                selectedAnswers: ["1", "2"],
            }
        },
    )
    const res = createResponse()
    await submitPollResponse(db, req, res)

    t.true(res._isEndCalled())
    t.is(res.statusCode, 200)
    //TODO: Check the actual data
})
