import express from 'express'
import cors from 'cors'
import { Request, Response, NextFunction } from 'express'
import { logger } from '../log'

const log = logger('handlers/handler')

export default () => {
    const handler = express()
    handler.use(cors())
    handler.use((req, _res, next) => {
        if (!req.path) {
            req.url = `/${req.url}` // Prepend '/' to keep query params if any
        }
        next()
    })
    return handler
}

export const ErrorHandler = (
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
) => {
    log.error(err)
    return res.status(500).send({ message: err.message, error: err })
}

export const addPrefix = (prefix: string) => {
    return (req: Request, _: Response, next: NextFunction) => {
        req.url = `/${prefix}${req.url}`
        next()
    }
}
