import * as firebase from 'firebase-admin'
import * as tty from "tty"
import * as fs from "fs"
import {exit} from 'process';

const usage = `
This script exports and imports *simple* collections from firebase as json.
All output and input is done via STDIN (pipes). It will not delte entries that
already exist but it will overwrite them if the provided key is the same

Known issues: References are not correctly resolved and the resulting export is junk

TODO:
  * Better auth/target selection

Usage: impex-collection import|export path

Params:
    import|export: select the direction
    path: path to a firebase collection

Example:
  ts-node impex-collection.ts export /test > test.json
  ts-node impex-collection.ts import /test < test.json
`.trim()

var serviceAccount = require("../firebase-key.json");
//var serviceAccount = require("./firebase-key.prod.json");

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  //databaseURL: "https://brunstadtv-online.firebaseio.com"
  databaseURL: "https://brunstadtv-online-dev.firebaseio.com",
});

const db = firebase.firestore();

async function exportCollection(path : string) : Promise<void> {
  const snapshot = await db.collection(path).get();
  let coll : {[key: string]: object} = {}
  snapshot.docs.map(x => coll[String(x.id)] = x.data())
  console.log(JSON.stringify(coll))
}

async function importCollection(path : string) : Promise<void> {
  if(process.stdin instanceof tty.ReadStream){
    process.stdin.setRawMode(true);
  }

  let data = fs.readFileSync(0, 'utf-8');
  let coll : {[key: string]: object} = {}
  try {
    coll = JSON.parse(data)
  } catch(e) {
    console.error(e)
    return
  }

  let targetCollection = db.collection(path)

  for (const [k, v] of Object.entries(coll)) {
    console.log(k, await targetCollection.doc(k).set(v))
  }
}

if (process.argv.length != 4) {
  console.log(usage)
  exit(0)
}

if (process.argv[2] == "import") {
  importCollection(process.argv[3]);
} else if (process.argv[2] == "export") {
  exportCollection(process.argv[3]);
}
