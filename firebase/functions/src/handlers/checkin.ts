import * as firebaseAdmin from "firebase-admin";
import handler, { ErrorHandler } from "./handler";
import { jwtCheck, syncUserAndClaims } from "../middleware";
import { n, EventModel } from "../model/index";

var db = null;

const checkinHandler = handler();

checkinHandler.get("/", jwtCheck, syncUserAndClaims, async (req, res) => {
  var eventModel = new EventModel(db, req.query.eventId);
  var result = await eventModel.checkin.actions.getCheckinStatus(req.user[n.claims.personId]);
  return res.json(result);
});

checkinHandler.post("/", jwtCheck, syncUserAndClaims, async (req, res) => {
  const personId = req.user[n.claims.personId];
  const eventId = req.query.eventId || req.body.eventId;
  var [latitude, longitude] = req.body.coords;
  var eventModel = new EventModel(db, eventId);
  // checkin current user first
  var coords = new firebaseAdmin.firestore.GeoPoint(latitude, longitude);
  if (Array.isArray(req.body.userIds) && req.body.userIds.length > 0) {
    await eventModel.checkin.actions.checkin(personId, req.body.userIds, coords);
  } else {
    // fallback to old behaviour is no userIds property received
    await eventModel.checkin.actions.checkin(personId, [personId], coords);
  }
  var updatedStatus = await eventModel.checkin.actions.getCheckinStatus(personId);
  return res.json(updatedStatus);
});

checkinHandler.get("/userCount", async (req, res) => {
  const { eventId } = req.query;
  var eventModel = new EventModel(db, eventId);
  var result = await eventModel.checkin.actions.updateCheckinCount();
  return res.status(200).send(result);
});

checkinHandler.use(ErrorHandler)
export default (firebaseDb: any) => {
  db = firebaseDb;
  return checkinHandler;
};
