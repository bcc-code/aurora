import { CompetitionActions, CompetitionRefs, CompetitionUpdate } from "../types/competition";
import { n } from "./index"

export class CompetitionModel {
    refs: CompetitionRefs;
    actions: CompetitionActions;

    constructor (firestore: any, increment: any, competitionId: string) {
        const db = firestore;
        const inputParams = { competitionId };
        const MAX_DISTANCE = 100;

        this.refs = {};
        this.actions = {};
        
        this.refs.competition = () => db.collection(n.competitions).doc(inputParams.competitionId);
        this.refs.entry = (personId) => this.refs.competition().collection(n.entries).doc(`${personId}`);
        this.refs.distanceShards = () => this.refs.competition().collection(n.distanceShards);
        this.refs.distanceShard = (shardId) => this.refs.distanceShards().doc(`${shardId}`);
        this.refs.distancesPerChurch = () => this.refs.competition().collection(n.distancesPerChurch);
        this.refs.distancePerChurch = (churchId) => this.refs.distancesPerChurch().doc(`${churchId}`);
        this.refs.user = (personId) => db.collection(n.users).doc(`${personId}`);

        this.actions.updateEntry = async (personId, distance, overrideMax = 0) => {

            console.log(`POST /competition/entry?competitionId=${inputParams.competitionId}, personId: ${personId}, distance: ${distance}, overrideMax: ${overrideMax}`)

            var entryDoc = await this.refs.entry(personId).get();

            console.log(`entryDoc for personId: ${personId} exists: ${entryDoc.exists}`)

            // TODO: add check on user if overrideMax > 0
            const calculatedMaxDistance = (overrideMax > MAX_DISTANCE) ? overrideMax : MAX_DISTANCE;

            var update: CompetitionUpdate = {};
            if (entryDoc.exists) {
                const entryData = entryDoc.data();
                update.distance = entryData.distance || 0;
                update.distanceToBeApproved = entryData.distanceToBeApproved || 0;
                update.churchId = entryData.churchId;
            } else {
                update.distance = 0;
                update.distanceToBeApproved = 0;

                // ensure distancePerChurch doc exists
                var userRef = this.refs.user(personId);
                console.log(`userRef: ${userRef.toString()}`);

                var userDoc = await userRef.get();
                if (!userDoc.exists) {
                    throw new Error(`PersonId '${personId}' does not exist.`);
                }
                var userData = userDoc.data();
                update.user = userRef;

                if (userData.churchId) {
                    update.churchId = userData.churchId;

                    var distancePerChurchDoc = await this.refs.distancePerChurch(userData.churchId).get();

                    if (!distancePerChurchDoc.exists) {
                        console.log(`Initializing distancePerChurch doc for churchId ${userData.churchId}`);
                        await this.refs.distancePerChurch(userData.churchId).set({ distance: 0 });
                    }
                } else {
                    console.error(`PersonId ${personId} is missing churchId. User: ${JSON.stringify(userData)}`);
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

            console.log(`Updating competition entry for personId: ${personId} /` +
                `update.distance: ${update.distance} /` +
                `update.distanceToBeApproved: ${update.distanceToBeApproved} /` +
                `distanceDelta: ${distanceDelta} /` +
                `distanceToBeApprovedDelta: ${distanceToBeApprovedDelta}`
            )

            // START batch
            var batch = db.batch();
            if (entryDoc.exists) {
                batch.update(this.refs.entry(personId), update);
            } else {
                batch.set(this.refs.entry(personId), update);
            }
            const shardId = Math.floor(personId % 10);

            batch.update(this.refs.distanceShard(shardId), {
                distance: increment(distanceDelta),
                distanceToBeApproved: increment(distanceToBeApprovedDelta)
            });
            if (update.churchId > 0) {
                batch.update(this.refs.distancePerChurch(update.churchId), {
                    distance: increment(distanceDelta)
                });
            }

            await batch.commit();
            // END batch

            delete update.user;

            return update;
        }
    }
}
