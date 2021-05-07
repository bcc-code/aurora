import * as firebaseAdmin from "firebase-admin";
import equal from "fast-deep-equal";
import { n } from "./constants";
import { IUser, UserActions, UserRefs, UserGetters } from "../types/user";
import { logger } from "../log";
import { firestore } from "firebase-admin";
import {DocumentSnapshot, QueryDocumentSnapshot} from "firebase-functions/lib/providers/firestore";
import {UserRecord} from "firebase-functions/lib/providers/auth";

const log = logger("model/user");

export class UserModel {
  refs: UserRefs;
  getters: UserGetters;
  actions: UserActions;
  db: firestore.Firestore;

  churches: firestore.CollectionReference<firestore.DocumentData>;
  users: firestore.CollectionReference<firestore.DocumentData>;
  permissions: firestore.CollectionReference<firestore.DocumentData>;

  constructor(firestore: firestore.Firestore) {
    this.db = firestore;
    this.refs = {};
    this.getters = {};
    this.actions = {};

    this.churches = this.db.collection(n.churches);
    this.users = this.db.collection(n.users);
    this.permissions = this.db.collection(n.permissions);
  }

  churchRef(churchId: string)  : firestore.DocumentReference{
    return this.churches.doc(churchId);
  }

  userRef(personId: string)  : firestore.DocumentReference{
    return this.users.doc(personId);
  }

  async isAdmin(personId: string | null): Promise<boolean> {
    if (personId === null) {
      return false;
    }
    return (await this.permissions.doc(personId).get()).exists;
  }

  async role(personId: string): Promise<string> {
    const permissionDoc = await this.permissions.doc(personId).get();
    if (permissionDoc.exists) {
      return permissionDoc.data()?.role as string ?? "viewer";
    }
    return "viewer";
  }

  async updateGuardianLinkedUsersList(
    userData: IUser,
    update: IUser,
    batch: firestore.WriteBatch
  ): Promise<boolean> {
    let modified = false;
    const users = new Map();
    const userRefs = new Map();

    const idsToAddTo: (number | null)[] = [
      (update.guardian1Id || userData.guardian1Id) ?? null,
      (update.guardian2Id || userData.guardian2Id) ?? null,
    ].filter((id) => Boolean(id) && id !== userData.personId);

    const idsToRemoveFrom = [
      userData.guardian1Id && update.guardian1Id !== userData.guardian1Id
        ? userData.guardian1Id
        : null,
      userData.guardian2Id && update.guardian2Id !== userData.guardian2Id
        ? userData.guardian2Id
        : null,
    ].filter((id) => Boolean(id) && !idsToAddTo.includes(id));

    for (const id of idsToRemoveFrom.concat(idsToAddTo)) {
      if (id && !userRefs.has(id)) {
        const ref = this.userRef(`${id}`);
        userRefs.set(id, ref);
      }
    }

    const p : Promise<void>[] = [];
    for (const [id, ref] of userRefs) {
      if (ref instanceof firestore.DocumentReference) {
        p.push(ref.get().then(u =>{
          if (u.exists) {
            users.set(id, u.data());
          }
          return
        }))
      }
    }
    await Promise.all(p);

    for (const id2 of idsToRemoveFrom) {
      const d = users.get(id2) as IUser;
      if (
        d &&
        Array.isArray(d.linkedUserIds) &&
        d.linkedUserIds.includes(userData.personId)
      ) {
        d.linkedUserIds = d.linkedUserIds.filter(
          (val: number) => val !== userData.personId
        );
        batch.update(this.userRef(d.personId.toString()), {
          linkedUserIds: d.linkedUserIds,
        });
        modified = true;
      }
    }
    for (const id3 of idsToAddTo) {
      const d = users.get(id3) as IUser;
      if (d) {
        if (!d.linkedUserIds) {
          d.linkedUserIds = [];
        }
        if (!d.linkedUserIds.includes(userData.personId)) {
          d.linkedUserIds.push(userData.personId);
          batch.update(this.userRef(d.personId.toString()), {
            linkedUserIds: d.linkedUserIds,
          });
          modified = true;
        }
      }
    }

    return modified;
  }

  async updateInternal(
    userRef: FirebaseFirestore.DocumentReference,
    userObj: FirebaseFirestore.DocumentSnapshot,
    update: IUser
  ) : Promise<DocumentSnapshot> {
    // try get existing user

    const userData : IUser = userObj.data() as IUser;
    const localBatch = this.db.batch();
    let userChanged = false;

    const guardiansChanged = await this.updateGuardianLinkedUsersList(
      userData,
      update,
      localBatch
    );
    if (
      update.firstName !== userData.firstName ||
      update.lastName !== userData.lastName ||
      (update.displayName !== null &&
        update.displayName !== userData.displayName) ||
      (update.uid !== null && update.uid !== userData.uid) ||
      (update.genderId !== null && update.genderId !== userData.genderId) ||
      (update.guardian1Id !== null &&
        update.guardian1Id !== userData.guardian1Id) ||
      (update.guardian2Id !== null &&
        update.guardian2Id !== userData.guardian2Id) ||
      (update.birthdate !== null && update.birthdate !== userData.birthdate) ||
      (update.churchId !== null && update.churchId !== userData.churchId) ||
      (update.churchName !== null && update.churchName !== userData.churchName) ||
      (update.countryName !== null &&
        update.countryName !== userData.countryName) ||
      (update.hasMembership !== null &&
        update.hasMembership !== userData.hasMembership)
    ) {
      userChanged = true;
      localBatch.update(userRef, update);
    }

    if (userChanged || guardiansChanged) {
      log.info(`Saving changes to user ID: ${update.personId}`);
      await localBatch.commit();

      const result = await userRef.get();
      return result;
    }
    return userObj;
  }

  async createOrUpdate(update: IUser) : Promise<DocumentSnapshot> {
    const userRef = this.userRef(`${update.personId}`);
    const userObj = await userRef.get();
    return userObj.exists
      ? await this.updateInternal(userRef, userObj, update)
      : await this.createInternal(update);
  }

  async createInternal(created: IUser) : Promise<DocumentSnapshot> {
    log.info(
      `Creating new user, ID: ${created.personId}, displayName: ${created.displayName ?? ""}`
    );
    const localBatch = this.db.batch();
    const linkedUserIds: number[] = [];

    // when creating, we should check if this user is a Guardian for any existing users
    const g1List = this.users.where("guardian1Id", "==", created.personId);
    const g1deps = await g1List.get();
    g1deps.forEach((results) => {
      if (!linkedUserIds.includes(results.data().personId)) {
        linkedUserIds.push(results.data().personId);
      }
    });
    const g2List = this.users.where("guardian2Id", "==", created.personId);
    const g2deps = await g2List.get();
    g2deps.forEach((results) => {
      if (!linkedUserIds.includes(results.data().personId)) {
        linkedUserIds.push(results.data().personId);
      }
    });
    created.linkedUserIds = linkedUserIds;
    localBatch.set(this.userRef(`${created.personId}`), created);

    await this.updateGuardianLinkedUsersList(created, created, localBatch);

    await localBatch.commit();

    return await this.userRef(`${created.personId}`).get();
  }

  async getUser(uid: string) : Promise<UserRecord|null> {
    try {
      const auth = firebaseAdmin.auth();
      return await auth.getUser(uid);
    } catch (error) {
      log.error(`getUser('${uid})`, error);
      return null;
    }
  }

  async updateFirebaseUser(user: IUser) : Promise<{personId?: number}> {
    if (!user.uid) {
      return {};
    }

    let firebaseUser = await this.getUser(user.uid);
    const userDisplayName =
      user.displayName ?? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();

    if (!firebaseUser) {
      log.warn(`No user found for uid: ${user.uid}, creating user...`);
      try {
        firebaseUser = await firebaseAdmin.auth().createUser({
          uid: user.uid,
          email: `${user.personId}@person.id`,
          displayName: userDisplayName,
        });
      } catch (error) {
        log.error(
          `Error creating user ID: ${user.personId}, ${user.uid}`,
          error
        );
      }
    } else {
      log.info(
        `Found user uid: ${firebaseUser.uid}, custom claims: ${JSON.stringify(
          firebaseUser.customClaims
        )}`
      );
      if (
        firebaseUser.displayName !== userDisplayName ||
        firebaseUser.email !== `${user.personId}@person.id`
      )
        firebaseUser = await firebaseAdmin.auth().updateUser(user.uid, {
          displayName: userDisplayName,
          email: `${user.personId}@person.id`,
        });
    }
    const customClaims = Object.assign({}, { personId: user.personId });
    if (
      firebaseUser &&
      (!firebaseUser.customClaims ||
        !equal(firebaseUser.customClaims, customClaims))
    ) {
      // need to update custom claims
      try {
        await firebaseAdmin.auth().setCustomUserClaims(user.uid, customClaims);
        log.info(
          `Updated claims for uid ${user.uid} to: ${JSON.stringify(
            customClaims
          )}`
        );
      } catch (error) {
        log.error(
          `Error attempting to update user claims for user ID ${user.personId}, '${user.uid} - ${error as string}`
        );
      }
    }
    return customClaims;
  }

  async syncUserAndClaims(loggedInUser: { [i: string]: string }) : Promise<{personId?: number}>{
    if (!loggedInUser) {
      const msg = "Could not create user, req.user not set.";
      log.error(msg);
      throw new Error(msg);
    }
    if (!loggedInUser[n.claims.personId]) {
      const msg = "Could not create user, req.user missing PersonID";
      log.error(msg);
      throw new Error(msg);
    }
    if (!loggedInUser[n.claims.uid]) {
      const msg = "Could not create user, req.user missing uid";
      log.error(msg);
      throw new Error(msg);
    }
    if (!loggedInUser[n.claims.uid].startsWith("auth0|")) {
      const msg = `User ID: ${loggedInUser[n.claims.personId]}: ${
        loggedInUser[n.claims.uid]
      }`;
      log.error(msg);
      throw new Error(msg);
    }

    const user: IUser = {
      personId: Number(loggedInUser[n.claims.personId]),
      uid: loggedInUser[n.claims.uid],
      firstName: loggedInUser[n.claims.firstName] || "",
      lastName: loggedInUser[n.claims.lastName] || "",
      birthdate: loggedInUser.birthdate || "",
      displayName: `${loggedInUser[n.claims.firstName]} ${
        loggedInUser[n.claims.lastName]
      }`.trim(),
    };

    if (loggedInUser[n.claims.churchId]) {
      user.churchId = Number(loggedInUser[n.claims.churchId]);
      if (user.churchId !== null) {
        const userChurch = (
          await this.churchRef(`${user.churchId}`).get()
        ).data() as { name: string, country: string };
        if (userChurch) {
          user.churchName = userChurch.name;
          user.countryName = userChurch.country;
        }
      } else {
        user.churchName = "";
        user.countryName = "";
      }
    }

    user.hasMembership = loggedInUser[n.claims.hasMembership] !== undefined;
    const result = await this.createOrUpdate(user);
    const userClaims =
      result && result.exists
        ? await this.updateFirebaseUser(result.data() as IUser)
        : {};
    return userClaims;
  }

  async getUserDocs(limit = 0, startAfter = 0, includeInactive = false) : Promise<QueryDocumentSnapshot[]> {
    let query = this.users.orderBy("personId").limit(limit);
    if (!includeInactive) {
      query = query.where("hasMembership", "==", true);
    }
    if (startAfter > 0) {
      query = query.startAfter(startAfter);
    }
    const results = await query.get();
    return results.docs;
  }

  async updateProfileImageUrl(
    personId: string,
    imageUrl: string,
    thumbnailUrl: string | null = null
  ) : Promise<void> {
    await this.userRef(personId).update({
      profilePicture: imageUrl,
      profilePictureThumb: thumbnailUrl,
      updatedAt: Date.now(),
      approved: false,
    });
  }
}
