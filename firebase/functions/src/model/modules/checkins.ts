import * as firebaseadmin from 'firebase-admin'
import { parallelAsync, calculateAge } from '../utils'
import { n } from '../constants'
import { UserModel } from '../user'
import { Module } from './module'
import { IUser } from '../../types/user'
import { logger } from '../../log'
import { firestore } from 'firebase-admin'
import _ from 'lodash'
import {delay} from '../../utils'

const log = logger('index')

interface CheckinDoc {
    personId: number
    checkedInBy: number
    timestamp: number
    coords: firestore.GeoPoint
    platform: string
}

export class CheckinStatus {
    canCheckin: boolean
    checkedIn: boolean
    personId: number
    firstName: string | null
    lastName: string | null
    profilePicture: string | null
    age: number
    linkedUsers?: Array<CheckinStatus | null>

    constructor(canCheckin: boolean, checkedIn: boolean, user: IUser) {
        this.canCheckin = canCheckin
        this.checkedIn = checkedIn
        this.personId = user.personId
        this.firstName = user.firstName ?? null
        this.lastName = user.lastName ?? null
        this.profilePicture = user.profilePicture ?? null
        this.age = calculateAge(new Date(user.birthdate ?? ''))
        this.linkedUsers = []
    }
}

export class CheckinModule extends Module {
    checkins: firestore.CollectionReference
    db: firestore.Firestore
    userModel: UserModel

    checkinRef(personId: string): firestore.DocumentReference {
        return this.checkins.doc(personId)
    }

    async getCheckinStatus(personId: string): Promise<firestore.DocumentData> {
        const appConfig =  await this.db.collection("configs").doc("brunstadtv-app").get();
        const checkinEnabled = appConfig.data()?.canCheckin as boolean ?? false;

        // lookup user document for logged on user
        const userCheckingInDoc = await this.userModel.userRef(personId).get()

        if (userCheckingInDoc.exists) {
            const existingCheckin = await this.checkinRef(personId).get()
            const userCheckingIn = userCheckingInDoc.data() as IUser

            const checkinStatus = new CheckinStatus(
                    checkinEnabled &&
                    (userCheckingIn.hasMembership ?? false),
                existingCheckin.exists,
                userCheckingIn
            )

            if (Array.isArray(userCheckingIn.linkedUserIds)) {
                checkinStatus.linkedUsers = await parallelAsync(
                    userCheckingIn.linkedUserIds,
                    async (
                        linkedUserId: number
                    ): Promise<CheckinStatus | null> => {
                        const linkedUserDoc = await this.userModel
                            .userRef(`${linkedUserId}`)
                            .get()
                        if (linkedUserDoc.exists) {
                            const linkedUser = linkedUserDoc.data() as IUser
                            if (!linkedUser.hasMembership) return null
                            const existingCheckin = await this.checkinRef(
                                linkedUserId.toString()
                            ).get()
                            return new CheckinStatus(
                                checkinEnabled,
                                existingCheckin.exists,
                                linkedUser
                            )
                        }
                        return null
                    }
                )

                checkinStatus.linkedUsers = checkinStatus.linkedUsers.filter(
                    (v) => v !== null
                )
            }
            return checkinStatus
        } else {
            const msg = `Could not get checkin status for personId ${personId}, non-existent user.`
            log.error(msg)
            return { message: msg, checkedIn: false }
        }
    }

    async getCoordsByPersonId(personId: string) : Promise<firestore.GeoPoint> {
        const personData = (await this.userModel.userRef(personId).get()).data()
        if (!personData || !personData.churchId) {
            return new firebaseadmin.firestore.GeoPoint(0,0);
        }

        const churchData = (await this.db.collection("churches").doc((personData.churchId as number).toFixed()).get()).data()
        if (!churchData || !churchData.coordinates) {
            return new firebaseadmin.firestore.GeoPoint(0,0);
        }
        return churchData.coordinates as firestore.GeoPoint;
    }

    async checkin(currentPersonId: string, platform = "NONE"): Promise<void> {
        let coords = new firebaseadmin.firestore.GeoPoint(0, 0) // Fallback value, we will replace it
        try {
            coords = await this.getCoordsByPersonId(currentPersonId)
        } catch(e) {
            log.error(e)
            /* Fallback to 0:0 coords in case we fail */
        }

        const currentStatus = await this.getCheckinStatus(currentPersonId)
        if (!currentStatus.canCheckin || currentStatus.checkedIn === true) {
            //return
        }

        const newCheckin: CheckinDoc = {
            personId: Number(currentPersonId),
            checkedInBy: Number(currentPersonId),
            coords: coords,
            timestamp: Date.now(),
            platform: platform,
        }

        const p1 = this.checkinRef(currentPersonId).set(newCheckin)

        const shard = currentPersonId.substring(currentPersonId.length - 2)
        const shardDoc = this.event.collection("checkinShards").doc(shard)

        await shardDoc.set({
            count: firestore.FieldValue.increment(1),
        }, {merge: true})
        await p1;

        void this.updateCheckinCount()
    }

    async updateCheckinCount(): Promise<{ checkedInUsers: number }> {
        // This whole thing should be handled by a single function that is processing
        // pubsub messages. This would allow us to for sure process all checkins, while
        // maintaining a 1/s write frequency.
        // Currently it runs async after every checkin, so the checkin speed *should* not be
        // affected (citation needed), as the request has the chance to complete before
        // this function completes execution.

        const evt = (await this.event.get()).data() as Record<string, number>
        if (!evt) {
            log.error("Unable to get event data")
            return { checkedInUsers: 0 }
        }

        if (evt.lastCountUpdate && evt.lastCountUpdate - Date.now() > -1000 ) {
            if (evt.updatePending) {
                return { checkedInUsers: evt.checkedInUsers }
            }

            await this.event.update({updatePending: true})
            await delay(700)
        }

        const shards = await this.event.collection("checkinShards").get()
        let count = shards.docs.reduce((p, c) => p+(c.data().count as number), 0)
        const extraCheckins = _.isFinite(evt.extraCheckins)
            ? evt.extraCheckins
            : 0
        const checkinFactor = _.isFinite(evt.checkinFactor)
            ? evt.checkinFactor
            : 1
        count = Math.round(count * checkinFactor)
        count += extraCheckins
        const docUpdate = {
            checkedInUsers: count,
            lastCountUpdate: Date.now(),
            updatePending: false,
        }
        await this.event.update(docUpdate)
        return docUpdate
    }

    constructor(
        firestore: firestore.Firestore,
        event: firestore.DocumentReference
    ) {
        super(event)
        this.db = firestore
        this.userModel = new UserModel(firestore)
        this.checkins = this.event.collection(n.checkins)
    }
}
