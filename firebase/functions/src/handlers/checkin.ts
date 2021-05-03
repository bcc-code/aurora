import {firestore} from "firebase-admin";
import { Request, Response } from "express";
import { n, EventModel } from "../model/index";

export async function checkinStatus(db : firestore.Firestore,req : Request, res : Response) {
  var eventModel = new EventModel(db, req.query.eventId);
  var result = await eventModel.checkin.actions.getCheckinStatus(req.user[n.claims.personId]);
  return res.json(result);
};

export async function userCount( db : firestore.Firestore,req : Request, res: Response) {
  const { eventId } = req.query;
  var eventModel = new EventModel(db, eventId);
  var result = await eventModel.checkin.actions.updateCheckinCount();
  return res.status(200).send(result);
};

export async function checkin(db : firestore.Firestore, req : Request, res : Response) {
  const personId = req.user[n.claims.personId];
  const eventId = req.query.eventId || req.body.eventId;
  var eventModel = new EventModel(db, eventId);
  await eventModel.checkin.actions.checkin(personId, [personId]);
  var updatedStatus = await eventModel.checkin.actions.getCheckinStatus(personId);
  return res.json(updatedStatus);
};

