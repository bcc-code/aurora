import * as firebase from 'firebase-admin'

var serviceAccount = require("../../firebase/functions/firebase-key.json");
// var serviceAccount = require("../firebase-key.prod.json");

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  // databaseURL: "https://brunstadtv-online.firebaseio.com"
  databaseURL: "https://brunstadtv-online-dev.firebaseio.com",
});

const db = firebase.firestore();

db.collection('users').get().then((querySnapshot) => {
    querySnapshot.docs.forEach(doc => {
        var userId = doc.id
        var linkedUserId = doc.data().LinkedUserIds
        var linkedUserIdSet = new Set(linkedUserId)
        var newLinkedUserId = [...linkedUserIdSet]
        
        // console.log('id :' + userId)
        // console.log('linkedUserId :' + linkedUserId)
        // console.log('newLinkedUserId: ' + newLinkedUserId)
        // console.log('')

        updatelinkedUserId(userId, newLinkedUserId)
    })
})

function updatelinkedUserId(userId: any, newLinkedUserId: any) {
    db.collection('users').doc(userId).update({
        LinkedUserIds: newLinkedUserId
    })
}
