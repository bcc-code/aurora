import jwt from 'express-jwt'
import jwks from 'jwks-rsa'
import { NextFunction, Request, Response } from 'express'
import config from '../configs/config.json'
import { logger } from '../log'
import firebase from 'firebase-admin'

const log = logger('jwtCheck')

export const jwtCheckFull = async (admin: firebase.app.App,req: Request, res: Response, next: NextFunction) : Promise<void> => {
    const fbToken = req.header('x-api-token')
    if (!fbToken) {
        // Check for BCC token
        return jwtCheck(req, res, next)
    }

    try {
        // Check for FB token
        await admin.auth().verifyIdToken(fbToken)
    } catch(e) {
        console.error(e)
        return res.status(401).end()
    }

    return next();
}

export const jwtCheck = (req: Request, res: Response, next: NextFunction) : void => {
    // get audience header
    let audience = req.headers.audience
    if (!audience) {
        log.info(
            `audience header missing, falling back to '${config.auth0.clientId}`
        )
        audience = config.auth0.clientId
    }

    const secret = jwks.expressJwtSecret({
        cache: false,
        rateLimit: true,
        jwksRequestsPerMinute: 10,
        jwksUri: `https://${config.auth0.domain}/.well-known/jwks.json`,
    })

    jwt({
        secret,
        audience: audience,
        issuer: `https://${config.auth0.domain}/`,
        algorithm: 'RS256',
    })(req, res, (err) => {
        if (err) {
            log.error(`Error in jwtCheck: ${err}`)
            res.status(401)
                .json({
                    error: err,
                })
                .end()
            return
        }

        if (next) {
            next()
        }
    })
}

export const jwtCheckMiddleware = (admin: firebase.app.App) : ((req: Request, res: Response, next: NextFunction) => Promise<void>) => {
    return (req, res, next) => { return jwtCheckFull(admin, req, res, next) }
}
