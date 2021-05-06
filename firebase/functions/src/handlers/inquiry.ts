import { EventModel } from "../model/event";
import { UserModel } from "../model/user";
import { Inquiry } from "../model/modules/inquiries";
import { IUser } from "../types/user";
import {firestore} from "firebase-admin";
import { Request, Response } from "express";
import {getPersonId} from "../model/utils";

export async function newInquiry(db : firestore.Firestore,req : Request, res : Response) : Promise<void> {
  const eventModel = new EventModel(db, req.query.eventId);
  const userModel = new UserModel(db);
  const currentUserObj = await userModel.userRef(getPersonId(req)).get();
  if (!currentUserObj.exists) {
    return res.status(400).send({ message: "User does not exist" }).end()
  }
  const currentUser = currentUserObj.data() as IUser;
  let newInquiry: Inquiry = {
    personId: currentUser.personId,
    firstName: currentUser.firstName ?? "",
    lastName: currentUser.lastName ?? "",
    displayName: currentUser.displayName ?? "",
    churchName: currentUser.churchName ?? "",
    countryName: currentUser.countryName ?? "",
    text: req.body.text || "",
    date: Date.now()
  }
  await eventModel.inquiries.submitInquiry(newInquiry);
  return res.sendStatus(200).end();
};
