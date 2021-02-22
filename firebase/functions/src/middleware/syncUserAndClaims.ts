import * as firebaseAdmin from "firebase-admin";
import { n, UserModel } from "../model/index";

export const syncUserAndClaims = async (req, res, next) => {
  if (req.user == null) {
    console.error("syncUserAndClaims - req.user is null!");
    return res.status(500).send({ message: "Invalid user." }).end();
  }
  const personId = req.user ? req.user[n.claims.personId] : null;

  if (isNaN(personId) || personId <= 0) {
    console.error("syncUserAndClaims - user missing personId claim");
    return res.status(500).send({ message: "User does not have a valid personId" }).end();
  }

  try {
    // make sure we have a user in user-groups
    var userModel = new UserModel(firebaseAdmin.firestore());
    var userClaims = await userModel.actions.syncUserAndClaims(req.user);
    req.userClaims = userClaims;
  } catch (error) {
    const msg = `Error occurred while syncronizing user ID: ${personId}.`;
    console.error(msg, error.message);
    return res.status(500).send({ message: msg, error: error }).end();
  }
  if (typeof next === "function") {
    next();
  }
};
