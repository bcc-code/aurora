import { n } from "../constants";
import { Module } from "./module";
import {firestore} from "firebase-admin";
export class FeedModule extends Module {

  feedIncoming : firestore.CollectionReference;
  feedApproved: firestore.CollectionReference;

  async submitFeedEntry(personId: string, feedEntry : firestore.DocumentData) {
    feedEntry.date = Date.now()
    const newFeedDoc = this.feedIncoming.doc()
    await newFeedDoc.set(feedEntry);
    const privateDoc = newFeedDoc.collection("private").doc("person");
    await privateDoc.set({personId});
  };

  constructor (event: firestore.DocumentReference) {
    super(event)
    this.feedIncoming =  this.event.collection(n.feedIncoming);
    this.feedApproved = this.event.collection(n.feedApproved);
  }
};
