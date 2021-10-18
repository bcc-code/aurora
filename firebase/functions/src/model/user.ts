import * as firebaseAdmin from 'firebase-admin'
import equal from 'fast-deep-equal'
import { n } from './constants'
import { IUser } from '../types/user'
import { logger } from '../log'
import { firestore } from 'firebase-admin'
import {
    QueryDocumentSnapshot,
} from 'firebase-functions/lib/providers/firestore'
import { UserRecord } from 'firebase-functions/lib/providers/auth'

const log = logger('model/user')

export class UserModel {
    db: firestore.Firestore

    churches: firestore.CollectionReference<firestore.DocumentData>
    users: firestore.CollectionReference<firestore.DocumentData>
    permissions: firestore.CollectionReference<firestore.DocumentData>

    constructor(firestore: firestore.Firestore) {
        this.db = firestore

        this.churches = this.db.collection(n.churches)
        this.users = this.db.collection(n.users)
        this.permissions = this.db.collection(n.permissions)
    }

    churchRef(churchId: string): firestore.DocumentReference {
        return this.churches.doc(churchId)
    }

    userRef(personId: string): firestore.DocumentReference {
        return this.users.doc(personId)
    }

    async isAdmin(personId: string | null): Promise<boolean> {
        if (personId === null) {
            return false
        }
        return (await this.permissions.doc(personId).get()).exists
    }

    async role(personId: string): Promise<string> {
        const permissionDoc = await this.permissions.doc(personId).get()
        if (permissionDoc.exists) {
            return (permissionDoc.data()?.role as string) ?? 'viewer'
        }
        return 'viewer'
    }

    async getUser(uid: string): Promise<UserRecord | null> {
        try {
            const auth = firebaseAdmin.auth()
            return await auth.getUser(uid)
        } catch (error) {
            log.error(`getUser('${uid})`, error)
            return null
        }
    }

    async updateFirebaseUser(personId : string, uid : string): Promise<void> {
        if (!uid) {
            return
        }

        let firebaseUser = await this.getUser(uid)

        if (!firebaseUser) {
            log.warn(`No user found for uid: ${uid}, creating user...`)
            try {
                firebaseUser = await firebaseAdmin.auth().createUser({
                    uid,
                    email: `${personId}@person.id`,
                    displayName: personId,
                })
            } catch (error) {
                log.error(
                    `Error creating user ID: ${personId}, ${uid}`,
                    error
                )
            }
        }

        const customClaims = Object.assign({}, { personId })
        if (
            firebaseUser &&
            (!firebaseUser.customClaims ||
                !equal(firebaseUser.customClaims, customClaims))
        ) {
            // need to update custom claims
            try {
                await firebaseAdmin
                    .auth()
                    .setCustomUserClaims(uid, customClaims)
                log.info(
                    `Updated claims for uid ${uid} to: ${JSON.stringify(
                        customClaims
                    )}`
                )
            } catch (error) {
                log.error(
                    `Error attempting to update user claims for user ID ${
                        personId
                    }, '${uid} - ${error as string}`
                )
            }
        }
    }

    async extractUserClaims(loggedInUser: {
        [i: string]: string
    }): Promise<{ personId?: number }> {
        if (!loggedInUser) {
            const msg = 'Could not create user, req.user not set.'
            log.error(msg)
            throw new Error(msg)
        }
        if (!loggedInUser[n.claims.personId]) {
            const msg = 'Could not create user, req.user missing PersonID'
            log.error(msg)
            throw new Error(msg)
        }
        if (!loggedInUser[n.claims.uid]) {
            const msg = 'Could not create user, req.user missing uid'
            log.error(msg)
            throw new Error(msg)
        }
        if (!loggedInUser[n.claims.uid].startsWith('auth0|')) {
            const msg = `User ID: ${loggedInUser[n.claims.personId]}: ${
                loggedInUser[n.claims.uid]
            }`
            log.error(msg)
            throw new Error(msg)
        }

        const personId = (loggedInUser[n.claims.personId] as unknown as number).toFixed()
        const uRef = this.userRef(personId)
        const data = ((await uRef.get()).data() ?? {}) as IUser
        return { personId: data.PersonId }
    }

    async getUserDocs(
        limit = 0,
        startAfter = 0,
        includeInactive = false
    ): Promise<QueryDocumentSnapshot[]> {
        let query = this.users.orderBy('personId').limit(limit)
        if (!includeInactive) {
            query = query.where('hasMembership', '==', true)
        }
        if (startAfter > 0) {
            query = query.startAfter(startAfter)
        }
        const results = await query.get()
        return results.docs
    }

    async updateProfileImageUrl(
        personId: string,
        imageUrl: string,
        thumbnailUrl: string | null = null
    ): Promise<void> {
        await this.userRef(personId).update({
            profilePicture: imageUrl,
            profilePictureThumb: thumbnailUrl,
            updatedAt: Date.now(),
            approved: false,
        })
    }
}
