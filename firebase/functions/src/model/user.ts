import * as firebaseAdmin from "firebase-admin";
import equal from "fast-deep-equal";
import { n } from "./index";
import { IUser, UserActions, UserRefs, UserGetters } from "../types/user";

export class UserModel {
  refs: UserRefs;
  getters: UserGetters;
  actions: UserActions;

  constructor(firestore: any) {
    const db = firestore;
    this.refs = {};
    this.getters = {};
    this.actions = {};

    this.refs.churches = () => db.collection(n.churches);
    this.refs.church = (churchId) => this.refs.churches().doc(`${churchId}`);
    this.refs.users = () => db.collection(n.users);
    this.refs.user = (personId) => this.refs.users().doc(`${personId}`);
    this.refs.permissions = () => db.collection(n.permissions);

    this.getters.isAdmin = async (personId) => {
      const permissionDoc = await this.refs.permissions().doc(`${personId}`).get()
      return permissionDoc.exists;
    }

    this.getters.role = async (personId) => {
      const permissionDoc = await this.refs.permissions().doc(`${personId}`).get()
      if (permissionDoc.exists)
        return permissionDoc.data().role
      return "viewer"
    }

    const updateGuardianLinkedUsersList = async (userData: IUser, update: IUser, batch: any) => {
      var modified = false;
      var users = new Map();
      var userRefs = new Map();
      var idsToAddTo = [
        update.guardian1Id || userData.guardian1Id,
        update.guardian2Id || userData.guardian2Id,
      ].filter((id) => !!id && id != userData.personId);
      var idsToRemoveFrom = [
        userData.guardian1Id && update.guardian1Id != userData.guardian1Id
          ? userData.guardian1Id
          : null,
        userData.guardian2Id && update.guardian2Id != userData.guardian2Id
          ? userData.guardian2Id
          : null,
      ].filter((id) => !!id && !idsToAddTo.includes(id));

      for (var id of idsToRemoveFrom.concat(idsToAddTo)) {
        if (id && !userRefs.has(id)) {
          const ref = this.refs.user(id);
          userRefs.set(id, ref);
        }
      }
      for (let [id, ref] of userRefs) {
        const user = await ref.get();
        if (user.exists) {
          users.set(id, user.data());
        }
      }

      for (var id2 of idsToRemoveFrom) {
        var d = users.get(id2);
        if (
          d &&
          Array.isArray(d.linkedUserIds) &&
          d.linkedUserIds.includes(userData.personId)
        ) {
          d.linkedUserIds = d.linkedUserIds.filter(
            (val) => val != userData.personId
          );
          batch.update(this.refs.user(d.personId), {
            linkedUserIds: d.linkedUserIds,
          });
          modified = true;
        }
      }
      for (var id3 of idsToAddTo) {
        var d = users.get(id3);
        if (d) {
          if (d.linkedUserIds == null) {
            d.linkedUserIds = [];
          }
          if (!d.linkedUserIds.includes(userData.personId)) {
            d.linkedUserIds.push(userData.personId);
            batch.update(this.refs.user(d.personId), {
              linkedUserIds: d.linkedUserIds,
            });
            modified = true;
          }
        }
      }

      return modified;
    };

    this.actions.createOrUpdate = async (update: IUser) => {
      const userRef = this.refs.user(update.personId);
      const userObj = await userRef.get();
      return userObj.exists
        ? await updateInternal(userRef, userObj, update)
        : await createInternal(update)
    };

    // assumes that caller has already check that user exists
    const updateInternal = async (userRef: FirebaseFirestore.DocumentReference, userObj: FirebaseFirestore.DocumentData, update: IUser) => {
      // try get existing user
      var userData = userObj.data();
      const localBatch = db.batch();
      var userChanged = false;

      var guardiansChanged = await updateGuardianLinkedUsersList(userData, update, localBatch);
      if (
        update.firstName != userData.firstName ||
        update.lastName != userData.lastName ||
        (update.displayName != null && update.displayName != userData.displayName) ||
        (update.uid != null && update.uid != userData.uid) ||
        (update.genderId != null && update.genderId != userData.genderId) ||
        (update.guardian1Id != null && update.guardian1Id != userData.guardian1Id) ||
        (update.guardian2Id != null && update.guardian2Id != userData.guardian2Id) ||
        (update.birthdate != null && update.birthdate != userData.birthdate) ||
        (update.churchId != null && update.churchId != userData.churchId) ||
        (update.churchName != null && update.churchName != userData.churchName) ||
        (update.countryName != null && update.countryName != userData.countryName) ||
        (update.hasMembership != null && update.hasMembership != userData.hasMembership)
      ) {
        userChanged = true;
        localBatch.update(userRef, update);
      }

      if (userChanged || guardiansChanged) {
        console.log(`Saving changes to user ID: ${update.personId}`);
        await localBatch.commit();

        var result = await userRef.get();
        return result;
      }
      return userObj;
    };

    // assumes user does not exist, if it did, the input will override the existing
    const createInternal = async (created: IUser) => {
      console.log(
        `Creating new user, ID: ${created.personId}, displayName: ${created.displayName}`
      );
      const localBatch = db.batch();
      var linkedUserIds = [];

      // when creating, we should check if this user is a Guardian for any existing users
      var g1List = this.refs.users().where("guardian1Id", "==", created.personId);
      var g1deps = await g1List.get();
      g1deps.forEach((results) => {
        if (!linkedUserIds.includes(results.data().personId)) {
          linkedUserIds.push(results.data().personId);
        }
      });
      var g2List = this.refs.users().where("guardian2Id", "==", created.personId);
      var g2deps = await g2List.get();
      g2deps.forEach((results) => {
        if (!linkedUserIds.includes(results.data().personId)) {
          linkedUserIds.push(results.data().personId);
        }
      });
      created.linkedUserIds = linkedUserIds;
      localBatch.set(this.refs.user(created.personId), created);

      await updateGuardianLinkedUsersList(created, created, localBatch);

      await localBatch.commit();

      var result = await this.refs.user(created.personId).get();
      return result;
    };

    const getUser = async (uid: any) => {
      try {
        const auth = firebaseAdmin.auth();
        return await auth.getUser(uid);
      } catch (error) {
        console.error(`getUser('${uid}) - error: ${error.message}`);
        return null;
      }
    };

    const updateFirebaseUser = async (user: IUser) => {
      var firebaseUser = await getUser(user.uid);
      const userDisplayName = user.displayName ?? `${user.firstName} ${user.lastName}`.trim();

      if (!firebaseUser) {
        console.warn(`No user found for uid: ${user.uid}, creating user...`);
        try {
          firebaseUser = await firebaseAdmin.auth().createUser({
            uid: user.uid,
            email: `${user.personId}@person.id`,
            displayName: userDisplayName,
          });
        } catch (error) {
          console.error(`Error creating user ID: ${user.personId}, '${user.uid} - ${error.message}`);
        }
      } else {
        console.log(`Found user uid: ${firebaseUser.uid}, custom claims: ${JSON.stringify(firebaseUser.customClaims)}`);
        if (firebaseUser.displayName != userDisplayName || firebaseUser.email != `${user.personId}@person.id`)
          firebaseUser = await firebaseAdmin.auth().updateUser(user.uid, {
            displayName: userDisplayName,
            email: `${user.personId}@person.id`,
          });
      }
      var customClaims = Object.assign({}, { personId: user.personId });
      if ( firebaseUser && (!firebaseUser.customClaims || !equal(firebaseUser.customClaims, customClaims))) {
        // need to update custom claims
        try {
          await firebaseAdmin.auth().setCustomUserClaims(user.uid, customClaims);
          console.log(`Updated claims for uid ${user.uid} to: ${JSON.stringify(customClaims)}`);
        } catch (error) {
          console.error(`Error attempting to update user claims for user ID ${user.personId}, '${user.uid} - ${error.message}`);
        }
      }
      return customClaims;
    };

    this.actions.syncUserAndClaims = async (loggedInUser) => {
      if (!loggedInUser) {
        const msg = "Could not create user, req.user not set.";
        console.error(msg);
        throw new Error(msg);
      }
      if (!loggedInUser[n.claims.personId]) {
        const msg = "Could not create user, req.user missing PersonID";
        console.error(msg);
        throw new Error(msg);
      }
      if (!loggedInUser[n.claims.uid]) {
        const msg = "Could not create user, req.user missing uid";
        console.error(msg);
        throw new Error(msg);
      }
      if (!loggedInUser[n.claims.uid].startsWith("auth0|")) {
        const msg = `User ID: ${loggedInUser[n.claims.personId]}: ${loggedInUser[n.claims.uid]}`;
        console.error(msg);
        throw new Error(msg);
      }

      var user: IUser = {
        personId: loggedInUser[n.claims.personId],
        uid: loggedInUser[n.claims.uid],
        firstName: loggedInUser[n.claims.firstName] || "",
        lastName: loggedInUser[n.claims.lastName] || "",
        birthdate: loggedInUser.birthdate || "",
        displayName: `${loggedInUser[n.claims.firstName]} ${ loggedInUser[n.claims.lastName]}`.trim(),
      };

      if (loggedInUser[n.claims.churchId]) {
        user.churchId = loggedInUser[n.claims.churchId];
        if (user.churchId != null) {
          const userChurch = (await this.refs.church(user.churchId).get()).data()
          user.churchName = userChurch.name;
          user.countryName = userChurch.country;
        }
        else {
          user.churchName = "";
          user.countryName = "";
        }
      }
      if (loggedInUser[n.claims.hasMembership] != undefined) {
        user.hasMembership = loggedInUser[n.claims.hasMembership]
      }

      var result = await this.actions.createOrUpdate(user);
      var userClaims = result && result.exists ? await updateFirebaseUser(result.data()) : {};
      return userClaims;
    };

    this.actions.getUserDocs = async (limit = 0, startAfter = 0, includeInactive = false) => {
      var query = this.refs.users().orderBy('personId').limit(limit)
      if (!includeInactive) {
        query = query.where('hasMembership', '==', true);
      }
      if (startAfter > 0) {
        query = query.startAfter(startAfter);
      }
      var results = await query.get();
      return results.docs;
    };

    this.actions.updateProfileImageUrl = async (personId, imageUrl, thumbnailUrl = null) => {
      await this.refs.user(personId).update({ profilePicture: imageUrl, profilePictureThumb: thumbnailUrl, updatedAt: Date.now(), approved: false });
    };
  }
}

