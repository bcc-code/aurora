import * as firebaseAdmin from 'firebase-admin'
import { n } from "../index";
import { InquiriesActions, InquiriesRefs } from "../../types/inquiries";
import { Module } from './module';
import { EventRefs } from '../../types/event';
import { IUser } from '../../types/user';

export class InquiriesModule extends Module {
  refs: InquiriesRefs;
  actions: InquiriesActions;

  constructor(event: EventRefs) {
    super(event);

    this.refs = {};
    this.actions = {};
    
    this.refs.inquiriesIncoming = () => this.event.event().collection(n.inquiriesIncoming);
    this.refs.inquiriesQueue = () => this.event.event().collection(n.inquiriesQueue);
  
    this.actions.submitInquiry = async (inquiry) => {
      await this.refs.inquiriesIncoming().add(inquiry);
    };
  
  }
}

export class Inquiry {
  personId: number;
  firstName: string;
  lastName: string;
  displayName: string;
  churchName: string;
  countryName: string;
  text: string;
  date?: FirebaseFirestore.FieldValue;

  constructor(user: IUser, text: string) {
    this.personId = user.personId;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.displayName = user.displayName;
    this.churchName = user.churchName;
    this.countryName = user.countryName;
    this.text = text;
    this.date = firebaseAdmin.firestore.FieldValue.serverTimestamp();
  }
}