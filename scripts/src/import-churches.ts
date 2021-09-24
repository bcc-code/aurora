import * as firebase from 'firebase-admin'

var serviceAccount = require("../firebase-key.json");
//var serviceAccount = require("../firebase-key.prod.json");

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
 // databaseURL: "https://brunstadtv-online.firebaseio.com"
  databaseURL: "https://brunstadtv-online-dev.firebaseio.com",
});

const db = firebase.firestore();

interface church {
    churchId: number,
    name: string,
    country: string,
    ds: number,
    participants: number,
    countryCode: string,
}

async function doImport() {
    let churches = await import("../../client/src/data/churches.json")

    let col = db.collection("churches")

    let churchData = Object.values(churches) as Array<church>
    let p = churchData.map(async c => {
        if (!c.churchId) {
            return
        }

        console.log(c.churchId, c.name)
        await col.doc(c.churchId.toFixed()).set(c)
    })

    await Promise.all(p)
}

doImport();
