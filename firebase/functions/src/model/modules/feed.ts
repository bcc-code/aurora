import { n } from "../index";
import { FeedActions, FeedRefs } from "../../types/feed";
import { EventRefs } from "../../types/event";
import { Module } from "./module";
export class FeedModule extends Module {
  refs: FeedRefs;
  actions: FeedActions;

  constructor (event: EventRefs) {
    super(event)
    
    this.refs = {};
    this.actions = {};

    this.refs.feedIncoming = () => event.event().collection(n.feedIncoming);
    this.refs.feedApproved = () => event.event().collection(n.feedApproved);

    this.actions.submitFeedEntry = async (personId, feedEntry) => {
      feedEntry.date = Date.now()
      let feed: FirebaseFirestore.DocumentData;
      const eventDoc = await event.event().get()
      feed = this.refs.feedIncoming().doc();
      var entry = await feed.set(feedEntry);
      var privateDoc = entry.collection("private").doc("person");
      await privateDoc.set({personId});
    };
  }
};