import jwt from 'express-jwt'
import jwks from 'jwks-rsa'
import { NextFunction, Request, Response } from 'express'
import { config } from '../utils';
import { logger } from '../log'
import firebase from 'firebase-admin'
import {get} from '@google-cloud/trace-agent'
const tracer = get();

const log = logger('jwtCheck')

export const jwtCheckFull = async (admin: firebase.app.App,req: Request, res: Response, next: NextFunction) : Promise<void> => {
    const t = tracer.createChildSpan({name: "jwtCheck"});
    const fbToken = req.header('x-api-token')
    if (!fbToken) {
        // Check for BCC token
        return jwtCheck(req, res, next)
    }

    try {
        // Check for FB token
        const claims = await admin.auth().verifyIdToken(fbToken)
        req.userClaims = claims;
    } catch(e) {
        console.error(e)
        res.status(401).end()
        return
    }

    t.endSpan()
    next()
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
        algorithms: ["RS256"],
    })(req, res, (err : string) => {
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
