import * as firebase from 'firebase-admin'

var serviceAccount = require("../../firebase/functions/firebase-key.json");
// var serviceAccount = require("../firebase-key.prod.json");

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  // databaseURL: "https://brunstadtv-online.firebaseio.com"
  databaseURL: "https://brunstadtv-online-dev.firebaseio.com",
});

const db = firebase.firestore();

async function sortNullToBottom() {
    await db.collection('users').get().then((querySnapshot) => {
        querySnapshot.docs.forEach(doc => {
            var userId = doc.id
            var linkedUserId = doc.data().LinkedUserIds
            var linkedUserIdSet = new Set(linkedUserId)
            var newLinkedUserId = [...linkedUserIdSet]
            updatelinkedUserId(userId, newLinkedUserId)
        })
    })
}

async function updatelinkedUserId(userId: string, newLinkedUserId: object) {
    await db.collection('users').doc(userId).update({
        LinkedUserIds: newLinkedUserId
    })
}

sortNullToBottom()
