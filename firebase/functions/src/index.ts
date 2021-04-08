import * as functions from "firebase-functions";
import cors from "cors";
import express, {Response, Request, Application} from "express";
import firebaseAdmin from "firebase-admin";
import { ErrorHandler, addPrefix } from "./handlers/handler";
import { adminCheck, generateResizedImage, jwtCheck, syncUserAndClaims } from './middleware';
import { checkin, checkinStatus, userCount } from "./handlers/checkin";
import { config } from "./utils";
import { logger } from './log';
import { submitCompetitionEntry } from "./handlers/competition";
import {deleteEvent, deleteQuestion} from "./handlers/delete";
import {getToken, login, processLoginCallback, getIdToken} from "./handlers/firebaseToken";
import {passport, sessionSettings } from "./middleware/passport";
import cookieSession from "cookie-session";

const log = logger('index');

const firebaseApp = firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(
    config.firebaseServiceAccount
  ),
  databaseURL: `https://${config.firebaseServiceAccount.projectId}.firebaseio.com`
});

log.info("Cloud functions initializing...");

const insecureHandlerWithPrefix = (prefix: string) : Application => {
  const handler = express();
  handler.use(cors());
  handler.use(addPrefix(prefix)); // ?? Type sig?
  handler.use(ErrorHandler); // ?? What's going on with the type sig?
  return handler;
}

const handlerWithPrefix = (prefix: string) : Application => {
  let handler = insecureHandlerWithPrefix(prefix);
  handler.use(jwtCheck);
  handler.use(syncUserAndClaims);
  return handler;
}

const adminHandlerWithPrefix = (prefix : string) : Application => {
  let handler = handlerWithPrefix(prefix);
  handler.use(adminCheck);
  return handler;
}

const firestore = firebaseApp.firestore()

const checkinHandler = handlerWithPrefix("checkin")
checkinHandler.get("/checkin/", (req : Request, res : Response) => checkinStatus(firestore, req, res));
checkinHandler.post("/checkin/", (req : Request, res : Response) => checkin(firestore, req, res));
checkinHandler.get("/checkin/userCount", (req : Request, res : Response) => userCount(firestore, req, res));

const appHandler = handlerWithPrefix("app");

const competitionHandler = handlerWithPrefix("competition");
competitionHandler.post("/competition/entry", (req : Request, res : Response) => submitCompetitionEntry(firestore, req, res));

const deleteHandler = adminHandlerWithPrefix("delete");
deleteHandler.post("/event/:event/question/:questionId", deleteQuestion);
deleteHandler.post("/event/:event", deleteEvent);

const tokenHandler = insecureHandlerWithPrefix("firebase");
tokenHandler.use(cookieSession(sessionSettings));
tokenHandler.use(passport.initialize());
tokenHandler.use(passport.session());
tokenHandler.get("/firebase/", jwtCheck, syncUserAndClaims, getToken);
tokenHandler.get("/firebase/login", login);
tokenHandler.get("/firebase/callback", processLoginCallback);
tokenHandler.get("/firebase/idtoken", getIdToken);


/*
const exp = {
  poll: functions
    .region("europe-west1", "us-central1")
    .https.onRequest(poll(firebaseApp.firestore())),
  feed: functions
    .region("europe-west1", "us-central1")
    .https.onRequest(feed(firebaseApp.firestore())),
  inquiry: functions
    .region("europe-west1", "us-central1")
    .https.onRequest(inquiry(firebaseApp.firestore())),
  bukGames: functions
    .region("europe-west1", "us-central1")
    .https.onRequest(bukGames(firebaseApp.firestore())),
  user: functions
    .region("europe-west1", "us-central1")
    .https.onRequest(user(firebaseApp.firestore())),
  thumbnail: functions
    .region("europe-west1", "us-central1")
    .storage.object().onFinalize((object) => generateResizedImage(object, firebaseApp.firestore())),
};
*/

log.info("Ready.");

module.exports = {
  app: functions.region("europe-west1").https.onRequest(appHandler),
  checkin: functions.region("europe-west1").https.onRequest(checkinHandler),
  competition: functions.region("europe-west1").https.onRequest(competitionHandler),
  delete: functions.region("europe-west1").https.onRequest(deleteHandler),
  firebase: functions.region("europe-west1").https.onRequest(tokenHandler),
};
