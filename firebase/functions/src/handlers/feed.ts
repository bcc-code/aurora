import handler, { ErrorHandler } from "./handler";
import { jwtCheck, syncUserAndClaims } from "../middleware";
import { n, EventModel, UserModel } from "../model/index";
import { logger } from '../log';
import { IUser } from "../types/user";
import { FeedEntry } from "../types/feed";
import {firestore} from "firebase-admin";
import { Request, Response } from "express";

const log = logger('handler/feed');

export async function newFeedPost(db : firestore.Firestore,req : Request, res : Response) : Promise<void> {
  try {
    const eventModel = new EventModel(db, req.query.eventId);
    const userModel = new UserModel(db);
    const personId = req.user[n.claims.personId];
    const currentUserObj = await userModel.refs.user(personId).get();
    if (!currentUserObj.exists) {
      return res.status(400).send({ message: "User does not exist" }).end()
    }
    const currentUser = currentUserObj.data() as IUser
    const churchDoc = await userModel.refs.church(currentUser.churchId).get();
    currentUser.churchName = churchDoc.data().name
    currentUser.countryName = churchDoc.data().country
    let feedEntry: FeedEntry = {
      firstName: currentUser.firstName || "",
      lastName: currentUser.lastName || "",
      displayName: currentUser.displayName || "",
      churchName: currentUser.churchName || "",
      countryName: currentUser.countryName || "",
      text: req.body.text || "",
      imageUrl: req.body.imageUrl || ""
    }
    await eventModel.feed.actions.submitFeedEntry(personId, feedEntry)
    return res.sendStatus(200).end();
  } catch (e) {
    log.error(e);
    return res.sendStatus(500).end();
  }
}
