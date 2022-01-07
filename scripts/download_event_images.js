const {firestore} = require("firebase-admin");
const admin = require("firebase-admin");

var serviceAccount = require("./firebase-key.prod.json");
//var serviceAccount = require("./firebase-key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://brunstadtv-online.firebaseio.com",
  // databaseURL: "https://brunstadtv-online-dev.firebaseio.com"
});

const db = admin.firestore();

async function getImageUrls(eventID, approved, incoming) {
    let doc = db.collection('events').doc(eventID)

    if (approved) {
        (await doc.collection('feed-outgoing').listDocuments()).map(async (doc) => {
            let d = (await doc.get()).data();
            if (d.imageUrl) {
                console.log(`curl -o "${doc.id}_outgoing.jpg" "${d.imageUrl}"`);
            }
        })
    }

    if (incoming) {
        (await doc.collection('feed-incoming').listDocuments()).map(async (doc) => {
            let d = (await doc.get()).data();
            if (d.imageUrl) {
                console.log(`curl -o "${doc.id}_incoming.jpg" "${d.imageUrl}"`);
            }
        })
    }

    if (incoming) {
        (await doc.collection('feed-approved').listDocuments()).map(async (doc) => {
            let d = (await doc.get()).data();
            if (d.imageUrl) {
                console.log(`curl -o "${doc.id}_approved.jpg" "${d.imageUrl}"`);
            }
        })
    }
}

getImageUrls('44133', true, true);
