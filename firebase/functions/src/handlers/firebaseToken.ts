import * as firebaseAdmin from 'firebase-admin'
import { getConfig } from '../utils'
import passport from 'passport'
import { AuthenticateOptions } from 'passport-auth0'
import { syncUserAndClaims } from '../middleware/syncUserAndClaims'
import { UserModel } from '../model/user'
import { logger } from '../log'
import { NextFunction, Request, Response } from 'express'
import { getPersonId } from '../model/utils'
import * as gaxios from 'gaxios'

const log = logger('handler/firebaseToken')

export async function getToken(req: Request, res: Response) : Promise<void> {
    const personId = getPersonId(req)
    if (!personId) {
        return res
            .status(400)
            .send({
                message: 'Unknown user',
            })
            .end()
    }

    try {
        const firebaseToken = await firebaseAdmin
            .auth()
            .createCustomToken(personId, req.params.userClaims)
        const userModel = new UserModel(firebaseAdmin.firestore())
        const userRole = await userModel.role(personId)
        return res.send({ firebaseToken, userRole }).end()
    } catch (err) {
        log.error(err)
        return res
            .status(500)
            .send({
                message: 'Something went wrong acquiring a Firebase token.',
                error: err,
            })
            .end()
    }
}

export async function login(req: Request, res: Response, next: NextFunction) : Promise<void> {
    const config = await getConfig();
    const authOptions: AuthenticateOptions = {
        scope: 'openid email profile church country',

        // @ts-ignore this is valid according to the docs
        audience: config.auth0.apiAudience,
    }
    return passport.authenticate('auth0', authOptions)(req, res, next)
}

export async function processLoginCallback(
    req: Request,
    res: Response,
    next: NextFunction
)  : Promise<void> {
    try {
        const config = await getConfig();
        passport.authenticate('auth0', (err, user) => {
            if (err) return next(err)
            if (!user) return res.redirect('./login')
            req.logIn(user, async (err) => {
                if (err) return next(err)
                req.user = user._json
                const userModel = new UserModel(firebaseAdmin.firestore())
                const userRole = await userModel.role(
                    req.user?.[
                        'https://login.bcc.no/claims/personId'
                    ].toString() ?? ''
                )
                await syncUserAndClaims(req, res, () => {})
                const firebaseToken = await firebaseAdmin
                    .auth()
                    .createCustomToken(user.id)
                return res.redirect(
                    `${config.app.baseUrl}/callback?accessToken=${
                        user.accessToken
                    }&firebaseToken=${firebaseToken}&role=${Buffer.from(
                        userRole
                    ).toString('base64')}`
                )
            })
        })(req, res, next)
    } catch (e) {
        log.error(e)
    }
}

export async function getIdToken(req: Request, res: Response) : Promise<void> {
    try {
        const config = await getConfig();
        const result = await gaxios.request({
            method: 'POST',
            url: `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${config.api.key}`,
            data: {
                token: req.body.token,
                returnSecureToken: true,
            },
        })

        const data = result.data as {
            idToken?: string
            refreshToken?: string
            expiresIn: string
        }

        if (result.status === 200 && data.idToken) {
            return res
                .send({
                    idToken: data.idToken,
                    refreshToken: data.refreshToken,
                    expirationDate:
                        Date.now() + parseInt(data.expiresIn) * 1000,
                })
                .end()
        }

        res.status(500)
            .send({
                message: 'Something went wrong acquiring an ID Token.',
            })
            .end()
    } catch (e) {
        log.error('idtoken throws: ', e)
        res.status(500)
            .send({
                message: 'Something went wrong acquiring an ID Token.',
            })
            .end()
    }
}
