import * as firebaseAdmin from 'firebase-admin'
import { UserModel } from '../model/user'
import { logger } from '../log'
import { NextFunction, Request, Response } from 'express'
import { getPersonId } from '../model/utils'

const log = logger('syncUserAndClaims')

export const syncUserAndClaims = async (
    req: Request,
    res: Response,
    next: NextFunction
) : Promise<void> => {
    if (req.user === null) {
        log.error('syncUserAndClaims - req.user is null!')
        return res.status(500).send({ message: 'Invalid user.' }).end()
    }

    if (!req.user) {
        // If we don't have a user, then just skip this.
        // It is likely a service account requesting
        return next();
    }

    const personId = getPersonId(req)

    if (personId === null) {
        log.error('syncUserAndClaims - user missing personId claim')
        return res
            .status(500)
            .send({ message: 'User does not have a valid personId' })
            .end()
    }

    try {
        // make sure we have a user in user-groups
        const userModel = new UserModel(firebaseAdmin.firestore())
        const userClaims = await userModel.syncUserAndClaims(req.user) // TODO: Where is the User type from
        req.params.userClaims = userClaims
    } catch (error) {
        const msg = `Error occurred while syncronizing user ID: ${personId}.`
        log.error(msg, error.message)
        return res.status(500).send({ message: msg, error: error }).end()
    }

    if (typeof next === 'function') {
        return next()
    }
}
