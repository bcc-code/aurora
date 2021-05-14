import { calculateAge, sumDeep } from './model/utils'
import * as googleServiceKey from '../firebase-key.json'
import configRaw from './configs/config.json'
import { firestore } from 'firebase-admin'

export const firebaseServiceAccount = {
    projectId: googleServiceKey.project_id,
    clientEmail: googleServiceKey.client_email,
    privateKey: googleServiceKey.private_key.replace(/\\n/g, '\n'),
}

export const config = {
    ...(configRaw as Record<string, unknown>),
    firebaseServiceAccount,
}

export async function exportCollection(db: firestore.Firestore, path : string) : Promise<void> {
  const snapshot = await db.collection(path).get();
  const coll : {[key: string]: string|number|Record<string, unknown>} = {}
  snapshot.docs.map(x => coll[String(x.id)] = x.data())
    return coll;
}

