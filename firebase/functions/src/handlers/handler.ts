import express from "express";
import cors from "cors";
import { Request } from "../types";
import { NextFunction, Response } from "express";
import { logger } from '../log';

export default () => {
    const handler = express();
    handler.use(cors());
    handler.use(function(req, _res, next) {
        if (!req.path) {
            req.url = `/${req.url}`; // Prepend '/' to keep query params if any
        }
        next()
    })
    return handler
}

export const ErrorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
    logger.error(err.message);
    return res.status(500).send({ message: err.message, error: err });
}
