import {Request} from 'express';
import { n } from "../model/constants";
import _ from 'lodash';
import {Dictionary} from "lodash";
import {firestore} from 'firebase-admin';

export const asyncForEach = async<T> (array : T[], callback : (e: T, index: number, array: T[]) => Promise<void>) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
};

export const asyncForEachParallel = async<T> (array : T[], callback : (e : T, index : number, array : T[]) => Promise<any>) => {
  const requests = [];

  for (let index = 0; index < array.length; index++) {
    requests[index] = callback(array[index], index, array);
  }
  return await Promise.all(requests);
};

export const calculateAge = (birthdate : Date) => {
  const diff_ms = Date.now() - birthdate.getTime();
  const age_dt = new Date(diff_ms);

  return Math.abs(age_dt.getUTCFullYear() - 1970);
};

export const deleteCollection = async (db : firestore.Firestore, collectionPath : string, batchSize : number) => {
  const collectionRef = db.collection(collectionPath);
  const query = collectionRef.orderBy('__name__').limit(batchSize);

  return new Promise((resolve : (arg0: number) => void, reject) : void => {
    deleteQueryBatch(db, query, resolve).catch(reject);
  });
}

async function deleteQueryBatch(db : firestore.Firestore, query : firestore.Query, resolve : (arg0 : number) => void) {
  const snapshot = await query.get();

  const batchSize = snapshot.size;
  if (batchSize === 0) {
    // When there are no documents left, we are done
    resolve(0);
    return;
  }

  // Delete documents in a batch
  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();

  // Recurse on the next process tick, to avoid
  // exploding the stack.
  process.nextTick(() => {
    deleteQueryBatch(db, query, resolve);
  });
}

// mututates a to merge the sum of a and b
export const sumDeep = (a : any, b : any) => { // TODO: This shoud not be "ANY"
  Object.keys(b).forEach((key) => {
    const bVal = b[key];
    const aVal = a[key];
    try {
      if (_.isNumber(bVal)) {
        if (_.isNumber(aVal)) {
          a[key] = aVal + bVal;
        } else if (aVal == null) {
          a[key] = bVal;
        }
      } else {
        if (_.isObjectLike(bVal)) {
          if (aVal == null) {
            a[key] = Object.assign({}, bVal);
          } else if (_.isObjectLike(aVal)) {
            sumDeep(aVal, bVal);
          }
        }
      }

    } catch (error) {
      console.error(error.message);
    }
  })
}

export const getPersonId = (req : Request) : string => {
  const personId = req.user?.['https://login.bcc.no/claims/personId'].toFixed() ?? null
  if (personId) {
    return personId.toString()
  }

  throw new Error(`Unable to find personId: ${personId}`)
}
