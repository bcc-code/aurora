import * as firebaseadmin from "firebase-admin"
import { asyncForEachParallel, calculateAge } from "../utils";
import { n } from "../constants";
import { UserModel } from "../user";
import { Module } from "./module";
import { IUser } from "../../types/user";
import { logger } from '../../log';
import {firestore} from "firebase-admin";

const log = logger('index');

interface CheckinDoc {
  personId: number;
  checkedInBy: number;
  coords: any;
  timestamp: number;
}

export class CheckinStatus {
  canCheckin: boolean;
  checkedIn: boolean;
  personId: number;
  firstName: string | null;
  lastName: string | null;
  profilePicture: string | null;
  age: number;
  linkedUsers?: Array<any>;

  constructor(canCheckin: boolean, checkedIn: boolean, user: IUser) {
    this.canCheckin = canCheckin;
    this.checkedIn = checkedIn;
    this.personId = user.personId,
      this.firstName = user.firstName ?? null,
      this.lastName = user.lastName ?? null,
      this.profilePicture = user.profilePicture ?? null,
      this.age = calculateAge(new Date(user.birthdate ?? "")),
      this.linkedUsers = []
  }
}

//checkins = (firestore: any, event: EventRefs) :
export class CheckinModule extends Module {
  checkins : firestore.CollectionReference;
  db: firestore.Firestore;
  userModel: UserModel;

  checkinRef(personId : string) {
    return this.checkins.doc(personId);
  }

  async getCheckinStatus(personId : string) : Promise<firestore.DocumentData> {
    const checkinEnabled = true;

    // lookup user document for logged on user
    const userCheckingInDoc = await this.userModel.userRef(personId).get();

    if (userCheckingInDoc.exists) {
      const existingCheckin = await this.checkinRef(personId).get();
      const userCheckingIn = userCheckingInDoc.data() as IUser;

      const checkinStatus = new CheckinStatus(
        !existingCheckin.exists
        && checkinEnabled
        && (userCheckingIn.hasMembership ?? false),
        existingCheckin.exists,
        userCheckingIn)

      if (Array.isArray(userCheckingIn.linkedUserIds)) {
        checkinStatus.linkedUsers = await asyncForEachParallel(
          userCheckingIn.linkedUserIds,
          async (linkedUserId: number): Promise<CheckinStatus | null> => {
            const linkedUserDoc = await this.userModel.userRef(`${linkedUserId}`).get();
            if (linkedUserDoc.exists) {
              const linkedUser = linkedUserDoc.data() as IUser;
              if (!linkedUser.hasMembership)  return null;
              const existingCheckin = await this.checkinRef(linkedUserId.toString()).get();
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
      log.error(msg);
      return { message: msg, checkedIn: false };
    }
  }

  async checkin(currentPersonId : string, userIds : string[]) {
    const coords =   new firebaseadmin.firestore.GeoPoint(0,0); // We keep this in case anything expects it
    const currentUser = await this.userModel.userRef(currentPersonId).get();

    const batch = this.db.batch();

    let newCheckinCount = 0;

    if (currentUser.exists) {
      const currentStatus = await this.getCheckinStatus(currentPersonId);
      if (userIds.includes(currentPersonId) && currentStatus.canCheckin) {
        const newCheckin: CheckinDoc = {
          personId: Number(currentPersonId),
          checkedInBy: Number(currentPersonId),
          coords: coords,
          timestamp: Date.now()
        }
        batch.set(this.checkinRef(currentPersonId), newCheckin);
        newCheckinCount++;
      }
      if (Array.isArray(currentStatus.linkedUsers)) {
        await asyncForEachParallel(
          currentStatus.linkedUsers,
          async (linkedUser: CheckinStatus) => {
            if (userIds.includes(linkedUser.personId.toString()) && linkedUser.canCheckin) {
              const newCheckin: CheckinDoc = {
                personId: linkedUser.personId,
                checkedInBy: Number(currentPersonId),
                coords: coords,
                timestamp: Date.now()
              }
              batch.set(this.checkinRef(linkedUser.personId.toString()), newCheckin);
              newCheckinCount++;
            }
          }
        );
      }
    }
    await batch.commit();
    const checkinFactor = (await this.event.get()).data()?.checkinFactor || 1;
    await this.event.update({ checkedInUsers: firestore.FieldValue.increment(Math.round(newCheckinCount * checkinFactor))})
  }

  async updateCheckinCount() {
    const allCheckins = await this.checkins.get();
    let count = allCheckins.size;
    const evt = await this.event.get();
    const extraCheckins = evt.data()?.extraCheckins || 0;
    const checkinFactor = evt.data()?.checkinFactor || 1;
    count = Math.round(count * checkinFactor);
    count += extraCheckins;
    const docUpdate = { checkedInUsers: count };
    await this.event.update(docUpdate);
    return docUpdate;
  }

  constructor (firestore: firestore.Firestore, event: firestore.DocumentReference) {
    super(event);
    this.db = firestore;
    this.userModel = new UserModel(firestore);

    this.checkins = this.event.collection(n.checkins);
  }
}
