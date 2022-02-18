import test from "ava"

import { createResponse, createRequest } from "node-mocks-http";
import { generateUser, getAuthedFirestore  } from "./utils";
import { getLinkedUsers } from "../src/handlers/user";
import { IUser } from "../src/types/user";

test("getLinkedUsers", async t => {
    const db = getAuthedFirestore()
    const u = await generateUser(db)
    await generateUser(db, false, Number(u))
    const u2 = await generateUser(db, true, Number(u))

    const req = createRequest(
        {
            user: { 'https://login.bcc.no/claims/personId': u },
        },
    )

    const res = createResponse()
    await getLinkedUsers(db, req, res)
    t.is(res.statusCode, 200)

    const data = res._getJSONData() as { linkedUsers: IUser[] }
    t.is(1, data.linkedUsers.length)
    t.is(data.linkedUsers[0].PersonId, Number(u2))
});
