import { asyncForEachParallel, calculateAge } from "../utils";
import { n, UserModel } from "../index";
import { CheckinActions, CheckinRefs } from "../../types/checkins";
import { EventRefs } from "../../types/event";
import { Module } from "./module";
import { IUser } from "../../types/user";


class CheckinDoc {
  personId: number;
  checkedInBy: number;
  coords: any;
  timestamp: number;

  constructor(personId: number, checkedInBy: number, coords: any) {
      this.personId = personId;
      this.checkedInBy = checkedInBy;
      this.coords = coords;
      this.timestamp = Date.now()
  }
}

export class CheckinStatus {
  canCheckin: boolean;
  checkedIn: boolean;
  personId: number;
  firstName: string;
  lastName: string;
  profilePicture: string;
  age: number;
  linkedUsers?: Array<any>;

  constructor(canCheckin: boolean, checkedIn: boolean, user: IUser) {
      this.canCheckin = canCheckin;
      this.checkedIn = checkedIn;
      this.personId = user.personId,
      this.firstName = user.firstName,
      this.lastName = user.lastName,
      this.profilePicture = user.profilePicture,
      this.age = calculateAge(new Date(user.birthdate)),
      this.linkedUsers = []
  }
}

//checkins = (firestore: any, event: EventRefs) :
export class CheckinModule extends Module {
  refs: CheckinRefs;
  actions: CheckinActions;

  constructor (firestore: any, event: EventRefs) {
    super(event);
    const db = firestore;
    const userModel = new UserModel(firestore);
    
    this.refs = {};
    this.actions = {};

    this.refs.checkins = () => this.event.event().collection(n.checkins);
    this.refs.checkin = (personId) => this.refs.checkins().doc(`${personId}`);
    
    this.actions.getCheckinStatus = async (personId) => {
      const checkinEnabled = true;
  
      // lookup user document for logged on user
      var userCheckingInDoc = await userModel.refs.user(personId).get();
  
      if (userCheckingInDoc.exists) {
        const existingCheckin = await this.refs.checkin(personId).get();
        const userCheckingIn = userCheckingInDoc.data() as IUser;

        let checkinStatus = new CheckinStatus(
          !existingCheckin.exists && checkinEnabled && userCheckingIn.hasMembership,
          existingCheckin.exists,
          userCheckingIn)
  
        if (Array.isArray(userCheckingIn.linkedUserIds)) {
          checkinStatus.linkedUsers = await asyncForEachParallel(
            userCheckingIn.linkedUserIds,
            async (linkedUserId: number): Promise<CheckinStatus> => {
              var linkedUserDoc = await userModel.refs.user(linkedUserId).get();
              if (linkedUserDoc.exists) {
                const linkedUser = linkedUserDoc.data() as IUser;
                if (!linkedUser.hasMembership)  return null;
                let existingCheckin = await this.refs.checkin(linkedUserId).get();
                return  new CheckinStatus(!existingCheckin.exists && checkinEnabled, existingCheckin.exists, linkedUser)
              }
              return null;
            }
          );
          checkinStatus.linkedUsers = checkinStatus.linkedUsers.filter((v) => v != null);
        }
        return checkinStatus;
      }
      else {
        const msg = `Could not get checkin status for personId ${personId}, non-existent user.`;
        console.error(msg);
        return { message: msg, checkedIn: false };
      }
    };
  
    this.actions.checkin = async (currentPersonId, userIds, coords) => {
      // TODO: reject if event not open for checkin
  
      const currentUser = await userModel.refs.user(currentPersonId).get();
  
      var batch = db.batch();
  
      if (currentUser.exists) {
        var currentStatus = await this.actions.getCheckinStatus(currentPersonId);
        if (userIds.includes(currentPersonId) && currentStatus.canCheckin) {
          batch.set(this.refs.checkin(currentPersonId), new CheckinDoc(currentPersonId, currentPersonId, coords));
        }
        if (Array.isArray(currentStatus.linkedUsers)) {
          await asyncForEachParallel(
            currentStatus.linkedUsers,
            async (linkedUser: CheckinStatus) => {
              if (userIds.includes(linkedUser.personId) && linkedUser.canCheckin) {
                batch.set(this.refs.checkin(linkedUser.personId), new CheckinDoc(linkedUser.personId, currentPersonId, coords));
              }
            }
          );
        }
      }
      await batch.commit();
    };
  
    this.actions.updateCheckinCount = async () => {
      var allCheckins = await this.refs.checkins().get();
      var count = allCheckins.size;
      var evt = await event.event().get();
      const extraCheckins = evt.data().extraCheckins || 0;
      count += extraCheckins;
      const docUpdate = { checkedInUsers: count };
      await event.event().update(docUpdate);
      return docUpdate;
    };
  }
};
