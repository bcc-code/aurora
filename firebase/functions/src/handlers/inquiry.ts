import handler, { ErrorHandler } from "./handler";
import { jwtCheck, syncUserAndClaims } from "../middleware";
import { n, EventModel, UserModel } from "../model/index";
import { Inquiry } from "../model/modules/inquiries";
import { IUser } from "../types/user";
import {firestore} from "firebase-admin";
import { Request, Response } from "express";

export async function newInquiry(db : firestore.Firestore,req : Request, res : Response) : Promise<void> {
  const eventModel = new EventModel(db, req.query.eventId);
  const userModel = new UserModel(db);
  const currentUserObj = await userModel.refs.user(req.user[n.claims.personId]).get();
  if (!currentUserObj.exists) {
    return res.status(400).send({ message: "User does not exist" }).end()
  }
  const currentUser = currentUserObj.data() as IUser;
  let newInquiry: Inquiry = {
    personId: currentUser.personId,
    firstName: currentUser.firstName,
    lastName: currentUser.lastName,
    displayName: currentUser.displayName,
    churchName: currentUser.churchName,
    countryName: currentUser.countryName,
    text: req.body.text || "",
    date: Date.now()
  }
  await eventModel.inquiries.actions.submitInquiry(newInquiry);
  return res.sendStatus(200).end();
};
