import * as firebaseAdmin from "firebase-admin";
import { n } from "./index";
import { EventRefs } from "../types/event";
import { FeedModule, PollModule, InquiriesModule, CheckinModule } from "./modules"

export class EventModel {
  refs: EventRefs;
  feed: FeedModule;
  poll: PollModule;
  inquiries: InquiriesModule;
  checkin: CheckinModule;

  constructor(firestore: any, eventId: string) {
    this.refs = {};
    this.refs.event = () => firestore.collection(n.events).doc(`${eventId}`)
    this.feed = new FeedModule(this.refs)
    this.inquiries = new InquiriesModule(this.refs)
    this.poll = new PollModule(firestore, firebaseAdmin.firestore.FieldValue.increment, this.refs)
    this.checkin = new CheckinModule(firestore, this.refs)
  }
}
