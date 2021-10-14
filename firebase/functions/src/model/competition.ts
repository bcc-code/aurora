import { n } from './constants'
import { logger } from '../log'
import { firestore } from 'firebase-admin'
import { CompetitionUpdate } from '../types/competition'
import { IUser } from '../types/user'

const log = logger('models/competition')
const MAX_DISTANCE = 100

export class CompetitionModel {
    db: firestore.Firestore
    competition: firestore.DocumentReference
    distanceShards: firestore.CollectionReference
    distancesPerChurch: firestore.CollectionReference
    competitionId: string

    entry(personId: string): firestore.DocumentReference {
        return this.competition.collection(n.entries).doc(personId)
    }

    distanceShard(shardId: number): firestore.DocumentReference {
        return this.distanceShards.doc(shardId.toString())
    }

    distancePerChurch(churchId: string): firestore.DocumentReference {
        return this.distancesPerChurch.doc(churchId)
    }

    user(personId: string): FirebaseFirestore.DocumentReference {
        return this.db.collection(n.users).doc(personId)
    }

    async updateEntry(
        personId: string,
        distance: number,
        overrideMax = 0
    ): Promise<CompetitionUpdate> {
        log.debug(
            `POST /competition/entry?competitionId=${this.competitionId}, personId: ${personId}, distance: ${distance}, overrideMax: ${overrideMax}`
        )

        const entryDoc = await this.entry(personId).get()

        log.info(
            `entryDoc for personId: ${personId} exists: ${entryDoc.exists}`
        )

        // TODO: add check on user if overrideMax > 0
        const calculatedMaxDistance =
            overrideMax > MAX_DISTANCE ? overrideMax : MAX_DISTANCE
        const update: CompetitionUpdate = {
            distance: 0,
            distanceToBeApproved: 0,
        }

        if (entryDoc.exists) {
            const entryData = entryDoc.data() as CompetitionUpdate
            update.distance = entryData.distance || 0
            update.distanceToBeApproved = entryData.distanceToBeApproved || 0
            update.churchId = entryData.churchId
        } else {
            update.distance = 0
            update.distanceToBeApproved = 0

            // ensure distancePerChurch doc exists
            const userRef = this.user(personId)
            log.debug(`userRef: ${userRef.toString()}`)

            const userDoc = await userRef.get()
            if (!userDoc.exists) {
                throw new Error(`PersonId '${personId}' does not exist.`)
            }
            const userData = userDoc.data() as IUser
            update.user = userRef

            if (userData.ChurchId) {
                update.churchId = userData.ChurchId

                const distancePerChurchDoc = await this.distancePerChurch(
                    userData.ChurchId.toString()
                ).get()

                if (!distancePerChurchDoc.exists) {
                    log.info(
                        `Initializing distancePerChurch doc for churchId ${userData.ChurchId}`
                    )
                    await this.distancePerChurch(
                        userData.ChurchId.toString()
                    ).set({ distance: 0 })
                }
            } else {
                log.error(
                    `PersonId ${personId} is missing churchId. User: ${JSON.stringify(
                        userData
                    )}`
                )
            }
        }

        const newMaxDistance =
            update.distance + update.distanceToBeApproved + distance
        const distanceDelta =
            newMaxDistance <= calculatedMaxDistance
                ? update.distanceToBeApproved + distance
                : 0
        const distanceToBeApprovedDelta =
            overrideMax > MAX_DISTANCE
                ? update.distanceToBeApproved * -1
                : distance - distanceDelta

        update.distance += distanceDelta
        update.distanceToBeApproved += distanceToBeApprovedDelta

        log.info(
            `Updating competition entry for personId: ${personId} /` +
                `update.distance: ${update.distance} /` +
                `update.distanceToBeApproved: ${update.distanceToBeApproved} /` +
                `distanceDelta: ${distanceDelta} /` +
                `distanceToBeApprovedDelta: ${distanceToBeApprovedDelta}`
        )

        const batch = this.db.batch()
        if (entryDoc.exists) {
            batch.update(this.entry(personId), update)
        } else {
            batch.set(this.entry(personId), update)
        }
        const shardId = Math.floor(Number(personId) % 10)

        batch.update(this.distanceShard(shardId), {
            distance: firestore.FieldValue.increment(distanceDelta),
            distanceToBeApproved: firestore.FieldValue.increment(
                distanceToBeApprovedDelta
            ),
        })
        if (update.churchId && update.churchId > 0) {
            batch.update(this.distancePerChurch(update.churchId.toString()), {
                distance: firestore.FieldValue.increment(distanceDelta),
            })
        }

        await batch.commit()
        // END batch

        delete update.user

        return update
    }
    constructor(firestore: firestore.Firestore, competitionId: string) {
        this.db = firestore
        this.competitionId = competitionId

        this.competition = this.db.collection(n.competitions).doc(competitionId)
        this.distanceShards = this.competition.collection(n.distanceShards)
        this.distancesPerChurch = this.competition.collection(
            n.distancesPerChurch
        )
    }
}
