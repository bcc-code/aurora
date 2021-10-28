import * as firebase from 'firebase-admin'

//let serviceAccount = require("../firebase-key.json");
let serviceAccount = require("../firebase-key.prod.json");

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: "https://brunstadtv-online.firebaseio.com"
  //databaseURL: "https://brunstadtv-online-dev.firebaseio.com",
});

const db = firebase.firestore();

async function dedup() {
    let data = await db.collection('users').get()
    let updates = data.docs.map(async doc => {
        console.log("Processing", doc.id);
        let linkedUserId = doc.data().LinkedUserIds

        if (linkedUserId == null) {
            return
        }

        let linkedUserIdSet = new Set(linkedUserId)
        let newLinkedUserId = [...linkedUserIdSet]

        if (newLinkedUserId.length != linkedUserId.length) {
            console.log("Updating ", doc.id);
            return await db.collection('users').doc(doc.id).update({
                LinkedUserIds: newLinkedUserId
            })
        }

        console.log("Skipping", doc.id);
    })

    console.log("Waiting for all")
    console.log(updates);
    await Promise.all(updates)
    console.log(updates);
}


dedup()
