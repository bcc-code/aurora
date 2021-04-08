import { n, UserModel } from "../model/index";

import handler, { ErrorHandler } from "./handler";
import { jwtCheck, syncUserAndClaims } from "../middleware";
import { IUser } from "../types/user";
import { config } from '../utils';

var db = null;

const userProfileHandler = handler();

userProfileHandler.post("/profileImage", jwtCheck, syncUserAndClaims, async (req, res) => {
  var userModel = new UserModel(db);
  await userModel.actions.updateProfileImageUrl(req.user[n.claims.personId], req.body.url, req.body.thumbnailUrl);
  return res.sendStatus(200);
});

userProfileHandler.get("/profileImage", jwtCheck, syncUserAndClaims, async (req, res) => {
  var userModel = new UserModel(db);
  const profileImageUrl = (await userModel.refs.user(req.user[n.claims.personId]).get()).data().profilePicture
  return res.status(200).send({ profilePictureUrl: profileImageUrl});
});

userProfileHandler.use(ErrorHandler)

export default (firebaseDb: any) => {
  db = firebaseDb;
  return userProfileHandler;
};
