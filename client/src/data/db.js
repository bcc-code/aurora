import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/storage'
import keys from '@/utils/keys.js'
import config from '../configs/config.json'

var firebaseApp = firebase
    .initializeApp( {
        apiKey: keys.FIREBASE.API_KEY,
        authDomain: keys.FIREBASE.AUTH_DOMAIN,
        databaseURL: keys.FIREBASE.DATABASE_URL,
        projectId: keys.FIREBASE.PROJECT_ID,
        storageBucket: keys.FIREBASE.STORAGE_BUCKET,
        messagingSenderId: keys.FIREBASE.MESSAGING_SENDER_ID,
        appId: keys.FIREBASE.APP_ID,
        measurementId: keys.FIREBASE.MEASUREMENT_ID
      });

if (config.firebase.logLevel) {
    firebase.firestore.setLogLevel(config.firebase.logLevel);
}

export const db = firebaseApp.firestore();
export const storage = firebaseApp.storage().ref();
export const impexBucket = firebaseApp.storage('gs://bcco-impex').ref()

const { TimeStamp, GeoPoint } = firebase.firestore
export { TimeStamp, GeoPoint }
