import { Request } from 'express'
import { firestore } from 'firebase-admin'
import { logger } from '../log'

const log = logger('models/utils')

export const asyncForEach = async <T>(
    array: T[],
    callback: (e: T, index: number, array: T[]) => Promise<void>
): Promise<void> => {
    for (let index = 0; index < array.length; index++) {
        // eslint-disable-next-line no-await-in-loop
        await callback(array[index], index, array)
    }
}

export const parallelAsync = async <T_IN, T_OUT>(
    array: T_IN[],
    callback: (e: T_IN, index: number, array: T_IN[]) => Promise<T_OUT>
): Promise<T_OUT[]> => {
    let promises: Promise<T_OUT>[] = []
    promises = array.map(callback)
    return await Promise.all(promises)
}

export const calculateAge = (birthdate: Date): number => {
    const diff_ms = Date.now() - birthdate.getTime()
    const age_dt = new Date(diff_ms)

    return Math.abs(age_dt.getUTCFullYear() - 1970)
}

export const deleteCollection = async (
    db: firestore.Firestore,
    collectionPath: string,
    batchSize: number
): Promise<number> => {
    const collectionRef = db.collection(collectionPath)
    const query = collectionRef.orderBy('__name__').limit(batchSize)

    return new Promise((resolve: (arg0: number) => void, reject): void => {
        deleteQueryBatch(db, query, resolve).catch(reject)
    })
}

async function deleteQueryBatch(
    db: firestore.Firestore,
    query: firestore.Query,
    resolve: (arg0: number) => void
) {
    const snapshot = await query.get()

    const batchSize = snapshot.size
    if (batchSize === 0) {
        // When there are no documents left, we are done
        resolve(0)
        return
    }

    // Delete documents in a batch
    const batch = db.batch()
    snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref)
    })
    await batch.commit()

    // Recurse on the next process tick, to avoid
    // exploding the stack.
    process.nextTick(() => {
        deleteQueryBatch(db, query, resolve).catch((e) => log.error(e))
    })
}

export const getPersonId = (req: Request): string => {
    const personId =
        req.user?.['https://login.bcc.no/claims/personId'].toFixed() ?? ""
    if (personId !== "") {
        return personId.toString()
    }

    throw new Error(`Unable to find personId: ${personId ?? '<null>'}`)
}
