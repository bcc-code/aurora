import * as firebaseAdmin from 'firebase-admin'
import { Request, Response, NextFunction } from 'express'
import { UserModel } from '../model/user'
import { logger } from '../log'
import { getPersonId } from '../model/utils'

const log = logger('adminCheck')

export const adminCheck = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const userModel = new UserModel(firebaseAdmin.firestore())
    const personId = getPersonId(req)
    if (!personId) {
        if (req.userClaims.iss.startsWith("https://securetoken.google.com/") && req.userClaims.email === "screens@bcc.online") {
            return next()
        }
        return next('PersonId not present')
    }

    try {
        if (!(await userModel.isAdmin(personId))) return res.status(403)
    } catch (error) {
        const msg = `Error occurred while checkin admin role for: ${personId}.`
        log.error(msg, error.message)
        return res.status(500).send({ message: msg, error: error }).end()
    }

    next()
}
