import * as firebaseAdmin from 'firebase-admin'
import equal from 'fast-deep-equal'
import { n } from './constants'
import { IUser } from '../types/user'
import { logger } from '../log'
import { firestore } from 'firebase-admin'
import { DateTime } from 'luxon'
import MembersAPI from '../apis/members'
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

    async updateFirebaseUser(user: IUser): Promise<{ personId?: number }> {
        if (!user.uid) {
            return {}
        }

        let firebaseUser = await this.getUser(user.uid)
        const userDisplayName =
            user.displayName ??
            `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()

        if (!firebaseUser) {
            log.warn(`No user found for uid: ${user.uid}, creating user...`)
            try {
                firebaseUser = await firebaseAdmin.auth().createUser({
                    uid: user.uid,
                    email: `${user.personId}@person.id`,
                    displayName: userDisplayName,
                })
            } catch (error) {
                log.error(
                    `Error creating user ID: ${user.personId}, ${user.uid}`,
                    error
                )
            }
        } else {
            log.info(
                `Found user uid: ${
                    firebaseUser.uid
                }, custom claims: ${JSON.stringify(firebaseUser.customClaims)}`
            )
            if (
                firebaseUser.displayName !== userDisplayName ||
                firebaseUser.email !== `${user.personId}@person.id`
            )
                firebaseUser = await firebaseAdmin.auth().updateUser(user.uid, {
                    displayName: userDisplayName,
                    email: `${user.personId}@person.id`,
                })
        }
        const customClaims = Object.assign({}, { personId: user.personId })
        if (
            firebaseUser &&
            (!firebaseUser.customClaims ||
                !equal(firebaseUser.customClaims, customClaims))
        ) {
            // need to update custom claims
            try {
                await firebaseAdmin
                    .auth()
                    .setCustomUserClaims(user.uid, customClaims)
                log.info(
                    `Updated claims for uid ${user.uid} to: ${JSON.stringify(
                        customClaims
                    )}`
                )
            } catch (error) {
                log.error(
                    `Error attempting to update user claims for user ID ${
                        user.personId
                    }, '${user.uid} - ${error as string}`
                )
            }
        }
        return customClaims
    }

    async updateFromMembers(personId: string, uid: string|null = null) : Promise<IUser> {
        console.log("Runnign update for ", personId);
        const uRef = this.userRef(personId)
        const data = (await uRef.get()).data() ?? {}

        let needsUpdate = !data
        needsUpdate = needsUpdate || !Boolean(data.lastUpdated)

        if (data && data.lastUpdated) {
            needsUpdate = DateTime.fromISO(data.lastUpdated) < DateTime.now().minus({week: 1})
        }

        if (!needsUpdate){
            return data as IUser;
        }

        const mApi = new MembersAPI() //TODO: Get key from config
        const membersData = await mApi.getPerson(personId)
        if (!membersData) {
            log.error("Unable to find member in members DB")
            throw new Error("Unable to find member")
        }
        data.birthdate = membersData.birthDate

        if (membersData.churchId) {
            data.churchId = membersData.churchId ?? null
        }
        data.churchName = membersData.church.org.name

        if (membersData.church.org.visitingAddress.country) {
            data.countryName = membersData.church.org.visitingAddress.country.nameEn
        } else {
            console.warn("Church with no name", membersData.church.org)
        }

        const linkedUsers = membersData.related.children.map(c => c.personID)

        if (uid) {
            data.uid = uid
        }

        data.personId = membersData.personID
        data.displayName = membersData.displayName
        data.firstName = membersData.firstName
        data.guardian1Id = membersData.guardianID ?? null
        data.guardian2Id = membersData.secondGuardianID ?? null
        data.lastName = membersData.lastName
        data.linkedUserIds = linkedUsers
        //data.profilePicture = membersData.profilePicture // This can only be done when we have webhooks
        //data.profilePictureThumb = membersData.profilePicture
        data.lastUpdated = DateTime.now().toISO()

        await Promise.all(linkedUsers.map((childId: number) => this.updateFromMembers(childId.toFixed())))
        await uRef.set(data)
        return data as IUser
    }

    async syncUserAndClaims(loggedInUser: {
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
        return await this.updateFromMembers(personId, loggedInUser[n.claims.uid])
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
