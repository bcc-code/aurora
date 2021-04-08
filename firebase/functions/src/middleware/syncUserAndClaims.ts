import * as firebaseAdmin from "firebase-admin";
import { n, UserModel } from "../model/index";
import { logger } from '../log';
import {NextFunction, Request, Response} from "express";
import {getPersonId} from "../model/utils";

const log = logger('syncUserAndClaims');

export const syncUserAndClaims = async (req : Request, res : Response, next : NextFunction) => {
  if (req.user == null) {
    log.error("syncUserAndClaims - req.user is null!");
    return res.status(500).send({ message: "Invalid user." }).end();
  }

  let personId = getPersonId(req);

  if (personId === null) {
    log.error("syncUserAndClaims - user missing personId claim");
    return res.status(500).send({ message: "User does not have a valid personId" }).end();
  }

  try {
    // make sure we have a user in user-groups
    var userModel = new UserModel(firebaseAdmin.firestore());
    var userClaims = await userModel.actions.syncUserAndClaims(req.user);
    req.params.userClaims = userClaims;
  } catch (error) {
    const msg = `Error occurred while syncronizing user ID: ${personId}.`;
    log.error(msg, error.message);
    return res.status(500).send({ message: msg, error: error }).end();
  }

  if (typeof next === "function") {
    return next();
  }
};
