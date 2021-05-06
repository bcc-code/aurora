import { n } from "../constants";
import { Module } from "./module";
import { firestore } from "firebase-admin";

export class InquiriesModule extends Module {
  inquiriesIncoming: firestore.CollectionReference;
  inquiriesQueue: firestore.CollectionReference;

  submitInquiry = async (inquiry: firestore.DocumentData) => {
    await this.inquiriesIncoming.add(inquiry);
  };

  constructor(event: firestore.DocumentReference) {
    super(event);
    this.inquiriesIncoming = this.event.collection(n.inquiriesIncoming);
    this.inquiriesQueue = this.event.collection(n.inquiriesQueue);
  }
}

export interface Inquiry {
  personId: number;
  firstName: string;
  lastName: string;
  displayName: string;
  churchName: string;
  countryName: string;
  text: string;
  date?: number;
}
