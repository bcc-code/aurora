import * as firebaseAdmin from "firebase-admin";
import { Request } from "../types";
import { Response, NextFunction} from "express";
import { UserModel } from "../model";
import { logger } from '../log';
import {getPersonId} from "../model/utils";

const log = logger('adminCheck');

export const adminCheck = (req: Request, res: Response, next: NextFunction) => {
    const userModel = new UserModel(firebaseAdmin.firestore());
    let personId = getPersonId(req);

    if (!personId) {
      return next("PersonId not present");
    }

    try {
        if (!userModel.getters.isAdmin(personId)) return res.status(403);
    } catch (error) {
        const msg = `Error occurred while checkin admin role for: ${personId}.`;
        log.error(msg, error.message);
        return res.status(500).send({ message: msg, error: error }).end();
    }

    next();
};
