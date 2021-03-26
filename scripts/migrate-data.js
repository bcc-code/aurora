const admin = require("firebase-admin");

var serviceAccount = require("./firebase-key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://brunstadtv-online.firebaseio.com"
});

const db = admin.firestore();

async function moveCollection(oldCollectionRef, newCollectionRef) {
    const snapshot  = await oldCollectionRef.get();
    await Promise.all(snapshot.docs.map(async (doc) => {
        await newCollectionRef.doc(doc.id).set(doc.data())
    }));
}

async function unarchiveAllEvents() {
    const snapshot  = await db.collection('events').get();
    await Promise.all(snapshot.docs.map(async (doc) => {
        await db.collection('events').doc(doc.id).update({ archived: false })
    }));
}

//moveCollection(db.collection('user-groups').doc('bcc').collection('users'), db.collection('users'))
//moveCollection(db.collection('user-groups').doc('bcc').collection('permissions'), db.collection('permissions'))
//moveCollection(db.collection('event-groups').doc('nvFmYfCG0CZpLGRa072B').collection('events'), db.collection('events'))
unarchiveAllEvents()