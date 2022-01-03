import { CompetitionModel } from '../model/competition'
import { logger } from '../log'
import { firestore } from 'firebase-admin'
import { Request, Response } from 'express'
import { getPersonId } from '../model/utils'
import {
    CompetitionRequestBody,
    CompetitionRequestQuery,
} from '../types/competition'

const log = logger('competition')

export async function submitCompetitionEntry(
    db: firestore.Firestore,
    req: Request,
    res: Response
): Promise<void> {
    const loggedInUserPersonId = getPersonId(req)
    const body: CompetitionRequestBody = req.body as CompetitionRequestBody
    const query: CompetitionRequestQuery = req.query as CompetitionRequestQuery
    const personId = body.personId ?? loggedInUserPersonId

    if (!personId) {
        return res
            .status(400)
            .send({ message: `Parameter 'personId' must be set` })
            .end()
    }

    if ((body.distance ?? -1) <= 0 && (body.overrideMaxDistance ?? -1) <= 1) {
        return res
            .status(400)
            .send({
                message: `Body payload parameter 'distance' must be a positive number.`,
            })
            .end()
    }

    try {
        const competitionModel = new CompetitionModel(
            db,
            query.competitionId || ''
        )
        const result = await competitionModel.updateEntry(
            personId,
            body.distance || 0,
            body.overrideMaxDistance || 0
        )
        return res.json(result).end()
    } catch (error) {
        const msg = `error - POST /competition/entry for user ID: ${personId}`
        log.error(msg, error)
        return res.status(500).send({ message: msg }).end()
    }
}
