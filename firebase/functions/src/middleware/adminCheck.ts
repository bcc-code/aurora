import * as firebaseAdmin from "firebase-admin";
import { Request } from "../types";
import { Response, NextFunction} from "express";
import { n, UserModel } from "../model";
import { logger } from '../log';

export const adminCheck = (req: Request, res: Response, next: NextFunction) => {
    const userModel = new UserModel(firebaseAdmin.firestore());
    const personId = req.user[n.claims.personId] || null;
    try {
        if (!userModel.getters.isAdmin(personId)) return res.status(403);
    } catch (error) {
        const msg = `Error occurred while checkin admin role for: ${personId}.`;
        logger.error(msg, error.message);
        return res.status(500).send({ message: msg, error: error }).end();
    }
    if (typeof next === "function") {
        next();
    }
};
