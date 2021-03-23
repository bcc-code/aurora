import { n, UserModel } from "../model/index";

import handler, { ErrorHandler } from "./handler";
import { jwtCheck, syncUserAndClaims } from "../middleware";
import { IUser } from "../types/user";
import { config } from '../utils';

var db = null;

const userProfileHandler = handler();
userProfileHandler.post("/profile", async (req, res) => {
  if (
	  !config.app.sharedApiKey || config.app.sharedApiKey.length < 10 || // Guard against missconfiguration
	  req.header("X-API-Key") != config.app.sharedApiKey
  ) {
    return res.status(401).send({ error: `Invalid api key` });
  }

  var userData: Array<IUser> = req.body;
  const userModel = new UserModel(db);
  var users = [];
  for (var i = 0; i < userData.length; i++) {
    const result = await userModel.actions.createOrUpdate(userData[i]);
    users.push(result);
  }
  return res.status(200).send({ count: users ? users.length : 0 });
});

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
