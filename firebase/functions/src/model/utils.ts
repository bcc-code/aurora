import _ from 'lodash';

export const asyncForEach = async (array, callback) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
};

export const asyncForEachParallel = async (array, callback) => {
  var requests = [];

  for (let index = 0; index < array.length; index++) {
    requests[index] = callback(array[index], index, array);
  }
  return await Promise.all(requests);
};

export const calculateAge = birthdate => {
  // Detect invalid date objects
  if (isNaN(birthdate)) {
    return 1000;
  }

  var diff_ms = Date.now() - birthdate.getTime();
  var age_dt = new Date(diff_ms);

  return Math.abs(age_dt.getUTCFullYear() - 1970);
};

export const deleteCollection = async (db, collectionPath, batchSize) => {
  const collectionRef = db.collection(collectionPath);
  const query = collectionRef.orderBy('__name__').limit(batchSize);

  return new Promise((resolve, reject) => {
    deleteQueryBatch(db, query, resolve).catch(reject);
  });
}

async function deleteQueryBatch(db, query, resolve) {
  const snapshot = await query.get();

  const batchSize = snapshot.size;
  if (batchSize === 0) {
    // When there are no documents left, we are done
    resolve();
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
export const sumDeep = (a, b) => {
  Object.keys(b).forEach((key, idx) => {
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
