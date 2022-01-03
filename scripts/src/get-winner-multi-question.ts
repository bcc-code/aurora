import * as firebase from 'firebase-admin'
import * as crypto from 'crypto'

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

async function main(eventId : string, minCorrect : number) : Promise<void> {
    let questionsFB = await db.collection(`events/${eventId}/questions`).get()
    let correct = new Map<string, string>()
    let promises = questionsFB.docs.map(async q => {
        let cFB = await q.ref.collection("answers").where("correct", "==", true).get()
        correct.set(q.id, cFB.docs[0].id)
    })
    await Promise.all(promises)

    let responses = await db.collection(`events/${eventId}/responses`).get()
    let scores = new Map<string, number>()
    responses.forEach(r => {
        let rdata = r.data()
        if (correct.get(rdata.question) != rdata.selected[0]) {
            return
        }

        scores.set(rdata.personId, (scores.get(rdata.personId) || 0) + 1)
    })

    let filteredScores = new Array<string>()
    scores.forEach((v, k) => {
        if (v < minCorrect) {
            return
        }
        filteredScores.push(k)
    })

    let personKm = new Map<string, number>()
    promises = filteredScores.map(async (v) => {
        let e = await db.doc(`competitions/wwr-winter-2021/entries/${v}`).get()
        let d = e.data()
        if (d) {
            personKm.set(v, d.distance)
        } else {
            personKm.set(v, 0)
        }
    })
    await Promise.all(promises)

    let sortedUsersMap = new Map([...personKm.entries()].sort((a, b) => b[1] - a[1]))
    console.log(sortedUsersMap)
}


main('44133', 5)
