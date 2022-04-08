import * as firebaseAdmin from 'firebase-admin'
import { config } from '../utils'
import passport from 'passport'
import { AuthenticateOptions } from 'passport-auth0'
import { UserModel } from '../model/user'
import { logger } from '../log'
import { NextFunction, Request, Response } from 'express'
import { getPersonId } from '../model/utils'
import * as gaxios from 'gaxios'

const log = logger('handler/firebaseToken')

export async function getToken(req: Request, res: Response) : Promise<void> {
    const personId = getPersonId(req)
    if (!personId) {
        res
            .status(400)
            .send({
                message: 'Unknown user',
            })
            .end()

        return
    }

    try {
        const firebaseToken = await firebaseAdmin
            .auth()
            .createCustomToken(personId, req.params.userClaims)
        const userModel = new UserModel(firebaseAdmin.firestore())
        const userRole = await userModel.role(personId)
        res.send({ firebaseToken, userRole }).end()
        return
    } catch (err) {
        log.error(err)
        res
            .status(500)
            .send({
                message: 'Something went wrong acquiring a Firebase token.',
                error: err,
            })
            .end()
        return
    }
}

export function login(req: Request, res: Response, next: NextFunction) : void {
    const authOptions: AuthenticateOptions = {
        scope: 'openid email profile church country',
        // @ts-ignore this is valid according to the docs
        audience: config.auth0.apiAudience,
    }

    const authFunc = passport.authenticate('auth0', authOptions)
    authFunc(req, res, next)
}

export function processLoginCallback(
    req: Request,
    res: Response,
    next: NextFunction
)  : void{
    try {
        passport.authenticate('auth0', (err, user) => {
            if (err) return next(err)
            if (!user) return res.redirect('./login')
            req.logIn(user, async (err) => {
                if (err) return next(err)
                req.user = user._json
                const userModel = new UserModel(firebaseAdmin.firestore())
                let personId = req.user?.[
                        'https://login.bcc.no/claims/personId'
                    ].toString() ?? '';
                const userRole = await userModel.role(personId)
                await userModel.updateFirebaseUser(personId, user.id)
                const firebaseToken = await firebaseAdmin
                    .auth()
                    .createCustomToken(user.id)
                let url =
                    `${config.app.baseUrl}/callback?firebaseToken=${firebaseToken}&role=${Buffer.from(
                        userRole
                    ).toString('base64')}`
                return res.redirect(302, url);
                // Note: redirect seems to break if url is > 2465 chars
            })
        })(req, res, next)
    } catch (e) {
        log.error(e)
    }
}

export async function getIdToken(req: Request, res: Response) : Promise<void> {
    try {
        const result = await gaxios.request({
            method: 'POST',
            url: `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${config.api.key}`,
            data: {
                token: req.body.token as string,
                returnSecureToken: true,
            },
        })

        const data = result.data as {
            idToken?: string
            refreshToken?: string
            expiresIn: string
        }

        if (result.status === 200 && data.idToken) {
            res
                .send({
                    idToken: data.idToken,
                    refreshToken: data.refreshToken,
                    expirationDate:
                        Date.now() + parseInt(data.expiresIn) * 1000,
                })
                .end()
            return
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
