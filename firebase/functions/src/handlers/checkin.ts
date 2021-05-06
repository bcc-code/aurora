import {firestore} from "firebase-admin";
import { Request, Response } from "express";
import { EventModel } from "../model/event";
import {getPersonId} from "../model/utils";

export async function checkinStatus(db : firestore.Firestore,req : Request, res : Response) {
  var eventModel = new EventModel(db, req.query.eventId);
  var result = await eventModel.checkin.getCheckinStatus(getPersonId(req));
  return res.json(result);
};

export async function userCount( db : firestore.Firestore,req : Request, res: Response) {
  const { eventId } = req.query;
  var eventModel = new EventModel(db, eventId);
  var result = await eventModel.checkin.updateCheckinCount();
  return res.status(200).send(result);
};

export async function checkin(db : firestore.Firestore, req : Request, res : Response) {
  const personId = getPersonId(req);
  const eventId = req.query.eventId || req.body.eventId;
  var eventModel = new EventModel(db, eventId);
  await eventModel.checkin.checkin(personId, [personId]);
  var updatedStatus = await eventModel.checkin.getCheckinStatus(personId);
  return res.json(updatedStatus);
};

