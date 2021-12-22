import * as firebase from 'firebase-admin'
import axios from "axios";

//var serviceAccount = require("../firebase-key.json");
var serviceAccount = require("../firebase-key.prod.json");

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: "https://brunstadtv-online.firebaseio.com"
  //databaseURL: "https://brunstadtv-online-dev.firebaseio.com",
});

const db = firebase.firestore();
const access_key = "<REPLACE>"

async function main() {
    let churches = await db.collection("churches").get()
    churches.docs.forEach(async (c) => {
        let d = c.data()
        let address = `${d.address.Address1} ${d.address.Address2} ${d.country}`
        if (d.address.Address1 == "") {
            address = `${d.name} ${d.country}`
        }

        let res = await axios.get(`http://api.positionstack.com/v1/forward?access_key=${access_key}&query=${encodeURIComponent(address)}`)

        if (res.data.data[0].latitude) {
            let d = res.data.data[0]
            let coordinates = new firebase.firestore.GeoPoint(d.latitude, d.longitude)
            await c.ref.update({coordinates})
            console.info(`Updated ${d.name}`)
        } else {
            console.warn(`Failed ${d.name}`)
        }
    })
}

main()
