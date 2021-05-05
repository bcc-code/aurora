import { n } from "./constants"
import { logger } from '../log';
import {firestore} from "firebase-admin";
import { CompetitionUpdate } from "../types/competition"

const log = logger('models/competition');
const MAX_DISTANCE = 100;

export class CompetitionModel {
  db: firestore.Firestore;
  competition: firestore.DocumentReference;
  distanceShards: firestore.CollectionReference;
  distancesPerChurch: firestore.CollectionReference;
  competitionId : string;
  increment : (i: number) => firestore.FieldValue;

  entry(personId : string) {
    return this.competition.collection(n.entries).doc(personId)
  }

  distanceShard(shardId : number){
    return  this.distanceShards.doc(shardId.toString())
  }

  distancePerChurch(churchId: string){
    return this.distancesPerChurch.doc(churchId);
  }

  user(personId: string) {
    return this.db.collection(n.users).doc(personId);
  }

  async updateEntry(personId : string, distance : number, overrideMax : number = 0) {

    log.debug(`POST /competition/entry?competitionId=${this.competitionId}, personId: ${personId}, distance: ${distance}, overrideMax: ${overrideMax}`)

    var entryDoc = await this.entry(personId).get();

    log.info(`entryDoc for personId: ${personId} exists: ${entryDoc.exists}`)

    // TODO: add check on user if overrideMax > 0
    const calculatedMaxDistance = (overrideMax > MAX_DISTANCE) ? overrideMax : MAX_DISTANCE;
    var update: CompetitionUpdate = {
      distance: 0,
      distanceToBeApproved: 0,
    };

    if (entryDoc.exists) {
      const entryData = entryDoc.data()!;
      update.distance = entryData.distance || 0;
      update.distanceToBeApproved = entryData.distanceToBeApproved || 0;
      update.churchId = entryData.churchId;
    } else {
      update.distance = 0;
      update.distanceToBeApproved = 0;

      // ensure distancePerChurch doc exists
      var userRef = this.user(personId);
      log.debug(`userRef: ${userRef.toString()}`);

      var userDoc = await userRef.get();
      if (!userDoc.exists) {
        throw new Error(`PersonId '${personId}' does not exist.`);
      }
      var userData = userDoc.data()!;
      update.user = userRef;

      if (userData.churchId) {
        update.churchId = userData.churchId;

        var distancePerChurchDoc = await this.distancePerChurch(userData.churchId).get();

        if (!distancePerChurchDoc.exists) {
          log.info(`Initializing distancePerChurch doc for churchId ${userData.churchId}`);
          await this.distancePerChurch(userData.churchId).set({ distance: 0 });
        }
      } else {
        log.error(`PersonId ${personId} is missing churchId. User: ${JSON.stringify(userData)}`);
      }
    }

    const newMaxDistance = update.distance + update.distanceToBeApproved + distance;
    var distanceDelta = (newMaxDistance <= calculatedMaxDistance)
      ? update.distanceToBeApproved + distance
      : 0;
    var distanceToBeApprovedDelta = (overrideMax > MAX_DISTANCE)
      ? update.distanceToBeApproved * -1
      : distance - distanceDelta;

    update.distance += distanceDelta;
    update.distanceToBeApproved += distanceToBeApprovedDelta;

    log.info(`Updating competition entry for personId: ${personId} /` +
      `update.distance: ${update.distance} /` +
      `update.distanceToBeApproved: ${update.distanceToBeApproved} /` +
      `distanceDelta: ${distanceDelta} /` +
      `distanceToBeApprovedDelta: ${distanceToBeApprovedDelta}`
    )

    var batch = this.db.batch();
    if (entryDoc.exists) {
      batch.update(this.entry(personId), update);
    } else {
      batch.set(this.entry(personId), update);
    }
    const shardId = Math.floor(+personId % 10);

    batch.update(this.distanceShard(shardId), {
      distance: this.increment(distanceDelta),
      distanceToBeApproved: this.increment(distanceToBeApprovedDelta)
    });
    if (update.churchId && update.churchId > 0) {
      batch.update(this.distancePerChurch(update.churchId.toString()), {
        distance: this.increment(distanceDelta)
      });
    }

    await batch.commit();
    // END batch

    delete update.user;

    return update;
  }
  constructor (firestore: firestore.Firestore, increment: (i: number) => firestore.FieldValue, competitionId: string) {
    this.db = firestore;
    this.competitionId = competitionId;
    this.increment = increment;

    this.competition = this.db.collection(n.competitions).doc(competitionId);
    this.distanceShards = this.competition.collection(n.distanceShards);
    this.distancesPerChurch = this.competition.collection(n.distancesPerChurch);

  }
}
