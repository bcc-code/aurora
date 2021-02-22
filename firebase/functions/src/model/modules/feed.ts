import { n } from "../index";
import { FeedActions, FeedRefs } from "../../types/feed";
import * as firebaseAdmin from "firebase-admin";
import { EventRefs } from "../../types/event";
import { Module } from "./module";
import { IUser } from "../../types/user";

export class FeedModule extends Module {
  refs: FeedRefs;
  actions: FeedActions;

  constructor (event: EventRefs) {
    super(event)
    
    this.refs = {};
    this.actions = {};

    this.refs.feedIncoming = () => event.event().collection(n.feedIncoming);
    this.refs.feedApproved = () => event.event().collection(n.feedApproved);

    this.actions.submitFeedEntry = async (feedEntry) => {
      feedEntry.date = firebaseAdmin.firestore.FieldValue.serverTimestamp()
      let feed: FirebaseFirestore.DocumentData;
      const eventDoc = await event.event().get()
      if (eventDoc.data().feedApproval)
        feed = this.refs.feedIncoming().doc();
      else {
        feed = this.refs.feedApproved().doc();
        feedEntry.approvedDate = feedEntry.date
      }
      await feed.set(feedEntry);
    };
  }
};

export class FeedEntry {
  personId: number;
  firstName: string;
  lastName: string;
  displayName: string;
  churchName: string;
  countryName: string;
  text: string;
  imageUrl: string;
  approvedDate?: FirebaseFirestore.FieldValue;
  date?: FirebaseFirestore.FieldValue;

  constructor (user: IUser, text: string, imageUrl: string ) {
    this.personId = user.personId
    this.firstName = user.firstName || ""
    this.lastName = user.lastName || ""
    this.displayName = user.displayName || ""
    this.churchName = user.churchName || ""
    this.countryName = user.countryName || ""
    this.text = text || ""
    this.imageUrl = imageUrl || ""
  }
}