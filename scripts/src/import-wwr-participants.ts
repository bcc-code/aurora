import * as firebase from 'firebase-admin'
import * as fs from "fs"
import csv from "csv-parser"


//var serviceAccount = require("../firebase-key.json");
var serviceAccount = require("../firebase-key.prod.json");

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: "https://brunstadtv-online.firebaseio.com"
  //databaseURL: "https://brunstadtv-online-dev.firebaseio.com",
});

const db = firebase.firestore();

async function main() {
fs.createReadStream('../../impex/wwrcount.csv')
  .pipe(csv())
  .on('data', async (row) => {
  let x = await db.collection("churches").where("name", "==", row.name).get()
      if (x.docs.length == 0) {
          console.log(row)
        return
      }
      await x.docs[0].ref.update({"participants": row.count})
  })
  .on('end', () => {
    console.log('CSV file successfully processed');
  });
}

main()
