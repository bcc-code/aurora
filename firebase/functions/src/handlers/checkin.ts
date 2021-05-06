import {firestore} from "firebase-admin";
import { Request, Response } from "express";
import { EventModel } from "../model/event";
import {getPersonId} from "../model/utils";

export async function checkinStatus(db : firestore.Firestore,req : Request, res : Response) {
  const eventModel = new EventModel(db, req.query.eventId);
  const result = await eventModel.checkin.getCheckinStatus(getPersonId(req));
  return res.json(result);
}

export async function userCount( db : firestore.Firestore,req : Request, res: Response) {
  const { eventId } = req.query;
  const eventModel = new EventModel(db, eventId);
  const result = await eventModel.checkin.updateCheckinCount();
  return res.status(200).send(result);
}

export async function checkin(db : firestore.Firestore, req : Request, res : Response) {
  const personId = getPersonId(req);
  const eventId = req.query.eventId || req.body.eventId;
  const eventModel = new EventModel(db, eventId);
  await eventModel.checkin.checkin(personId, [personId]);
  const updatedStatus = await eventModel.checkin.getCheckinStatus(personId);
  return res.json(updatedStatus);
}

