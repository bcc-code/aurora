import * as firebase from 'firebase-admin'

//var serviceAccount = require("../firebase-key.json");
var serviceAccount = require("../firebase-key.prod.json");

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: "https://brunstadtv-online.firebaseio.com"
  //databaseURL: "https://brunstadtv-online-dev.firebaseio.com",
});

const db = firebase.firestore();

async function countInEvent(eventId : string) : Promise<void> {
    let cis = (await db.collection(`events/${eventId}/checkins`).get()).docs
    let users = db.collection('users');

    let countries  : Map<string, number> = new Map<string, number>();
    let pids = cis.map(async x => {
        let p = await users.doc(`${x.data().personId}`).get()
        let d = p.data()
        if (!d) {
            return
        }
        let y = d.CountryName as string
        countries.set(y, 1)
    })


    console.log(await Promise.all(pids))
    console.log("Countries:", countries.size);
}


countInEvent('44113')
