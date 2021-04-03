const {firestore} = require("firebase-admin");
const admin = require("firebase-admin");

var serviceAccount = require("./firebase-key.prod.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://brunstadtv-online.firebaseio.com",
});

const db = admin.firestore();

async function deleteLocationData() {
    (await db.collection('events').listDocuments()).map(async (doc) => {
        (await doc.collection('checkins').listDocuments()).map(async (doc) => {
            let d = (await doc.get()).data()
            d['coords'] = new firestore.GeoPoint(0, 0)
            await doc.set(d);
        })
    })
}

deleteLocationData()
