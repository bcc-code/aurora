import { firestore } from "firebase-admin";

export class Module {
  event: firestore.DocumentReference;

  constructor(event: firestore.DocumentReference) {
    this.event = event;
  }
}
