import * as functions from "firebase-functions";
import * as firebaseAdmin from "firebase-admin";

import { config } from "./utils";
import { app, checkin, feed, inquiry, poll, user, firebaseToken, competition, bukGames, deleteHandler } from "./handlers";
import { generateResizedImage } from './middleware';
import { logger } from './log';


const firebaseApp = firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(
    config.firebaseServiceAccount
  ),
  databaseURL: `https://${config.firebaseServiceAccount.projectId}.firebaseio.com`
});

logger.info("Cloud functions initializing...");
logger.debug("Functions config:", JSON.stringify(config));

export const exp = {
  app: functions
    .region("europe-west1", "us-central1")
    .https.onRequest(app),
  firebase: functions
    .region("europe-west1", "us-central1")
    .https.onRequest(firebaseToken),
  poll: functions
    .region("europe-west1", "us-central1")
    .https.onRequest(poll(firebaseApp.firestore())),
  checkin: functions
    .region("europe-west1", "us-central1")
    .https.onRequest(checkin(firebaseApp.firestore())),
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
  competition: functions
    .region("europe-west1", "us-central1")
    .https.onRequest(competition(firebaseApp.firestore())),
  thumbnail: functions
    .region("europe-west1", "us-central1")
    .storage.object().onFinalize((object) => generateResizedImage(object, firebaseApp.firestore())),
  delete: functions
    .region("europe-west1", "us-central1")
    .https.onRequest(deleteHandler)
};

logger.info("Ready.");
