import * as firebase from 'firebase-admin'

//var serviceAccount = require("../firebase-key.json");
var serviceAccount = require("../firebase-key.prod.json");
//var serviceAccount = require("../firebase-key.sta.json");

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: "https://brunstadtv-online.firebaseio.com"
  //databaseURL: "https://brunstadtv-online-dev.firebaseio.com",
  //databaseURL: "https://staging-bcc-online.firebaseio.com",
});

const db = firebase.firestore();

interface Result {
    resp: number,
    people: number,
    eventId: string,
}

async function getData(eventId : string) : Promise<Result> {
  const query = await db.collection(`events/${eventId}/responses`).get();
  let resp = query.docs.length

  let p = new Set();
  query.docs.forEach((d) => {
    p.add(d.data().personId)
  })

  return {resp, people: p.size, eventId}
}

async function main() : Promise<void> {
    let events = ['44121', '44147', '22149', '44153', '44163', '44166']
    let res = events.map(getData)
    Promise.all(res).then(console.log)
}

main()
