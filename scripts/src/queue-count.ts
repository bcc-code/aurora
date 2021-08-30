import * as firebase from 'firebase-admin'
import * as tty from "tty"
import * as fs from "fs"
import {exit} from 'process';
import * as firestore from "@google-cloud/firestore";

//var serviceAccount = require("../firebase-key.json");
var serviceAccount = require("../firebase-key.prod.json");

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: "https://brunstadtv-online.firebaseio.com"
  //databaseURL: "https://brunstadtv-online-dev.firebaseio.com",
});

const db = firebase.firestore();

interface counts {
    id: string;
    incoming: number;
    outgoing: number;
    approved: number;
    rejected: number;
}

async function countInEvent(e : firestore.QueryDocumentSnapshot<firestore.DocumentData>) : Promise<counts> {
        let incoming = (await e.ref.collection('feed-incoming').get())
    return {
        id: e.id,
        incoming: incoming.size,
        rejected: incoming.docs.filter((x) => x.data().tags && (x.data().tags as Array<string>).includes("rejected")).length,
        outgoing: (await e.ref.collection('feed-outgoing').get()).size,
        approved: (await e.ref.collection('feed-approved').get()).size,
    }
}

async function dumpCounts() : Promise<void> {
    const snapshot = await db.collection('events').get();
    let x = snapshot.docs.map(countInEvent)
    let y = await Promise.all(x)
    console.log("id,approved,rejected,outgoing,incoming");
    y.forEach((x) => console.log(`${x.id},${x.approved},${x.rejected},${x.outgoing},${x.incoming}`))
}

dumpCounts()
