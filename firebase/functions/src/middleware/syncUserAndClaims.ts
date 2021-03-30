import * as firebaseAdmin from "firebase-admin";
import { Request } from "../types";
import { Response, NextFunction} from "express";
import { UserModel } from "../model/index";
import { logger } from "../log";

export const syncUserAndClaims = async (req: Request, res: Response, next: NextFunction) => {
  if (req.user == null) {
    logger.error({"labels": {"function":"syncUserAndClaims"}}, "syncUserAndClaims - req.user is null!");
    return res.status(500).send({ message: "Invalid user." }).end();
  }
  const personId = req.user ? req.user.personId : -1;

  if (isNaN(personId) || personId <= 0) {
    logger.error("syncUserAndClaims - user missing personId claim");
    return res.status(500).send({ message: "User does not have a valid personId" }).end();
  }

  try {
    // make sure we have a user in user-groups
    var userModel = new UserModel(firebaseAdmin.firestore());
    if (!userModel) {
      throw new Error("Failed to create user model")
    }

    var userClaims = await userModel!.actions.syncUserAndClaims(req.user);
    req.userClaims = userClaims;
  } catch (error) {
    const msg = `Error occurred while syncronizing user ID: ${personId}.`;
    logger.error({"labels": {"function":"syncUserAndClaims"}}, msg, error.message);
    return res.status(500).send({ message: msg, error: error }).end();
  }
  if (typeof next === "function") {
    next();
  }
};
