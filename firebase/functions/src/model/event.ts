import * as firebaseAdmin from "firebase-admin";
import { n } from "./index";
import { FeedModule, PollModule, InquiriesModule, CheckinModule } from "./modules"
import {firestore} from "firebase-admin";

export class EventModel {
  feed: FeedModule;
  poll: PollModule;
  inquiries: InquiriesModule;
  checkin: CheckinModule;

  db: firestore.Firestore;
  eventRef : firestore.DocumentReference;


  constructor(firestore: firestore.Firestore, eventId: string) {
    this.db = firestore
    this.eventRef = this.db.collection(n.events).doc(eventId)
    this.feed = new FeedModule(this.eventRef)
    this.inquiries = new InquiriesModule(this.eventRef)
    this.poll = new PollModule(firestore, firebaseAdmin.firestore.FieldValue.increment, this.eventRef)
    this.checkin = new CheckinModule(firestore, this.eventRef)
  }
}
