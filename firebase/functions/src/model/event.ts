import { n } from "./constants";
import { FeedModule } from "./modules/feed";
import { InquiriesModule } from "./modules/inquiries";
import { PollModule } from "./modules/poll";
import { CheckinModule } from "./modules/checkins";
import { firestore } from "firebase-admin";

export class EventModel {
  feed: FeedModule;
  poll: PollModule;
  inquiries: InquiriesModule;
  checkin: CheckinModule;

  db: firestore.Firestore;
  eventRef: firestore.DocumentReference;

  constructor(firestore: firestore.Firestore, eventId: string) {
    this.db = firestore;
    this.eventRef = this.db.collection(n.events).doc(eventId);
    this.feed = new FeedModule(this.eventRef);
    this.inquiries = new InquiriesModule(this.eventRef);
    this.poll = new PollModule(firestore, this.eventRef);
    this.checkin = new CheckinModule(firestore, this.eventRef);
  }
}
