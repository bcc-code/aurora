const config = require("../configs/config.json");
const keys = {
  env: process.env.NODE_ENV,
  APP: {
    ID: config.app.id,
    NAME: config.app.name
  },
  GA_TRACKER_ID: config.app.gaId,
  AUTH0: {
    DOMAIN: "https://" + config.auth0.domain,
    CLIENT_ID: config.auth0.clientId,
    API_AUDIENCE: config.auth0.apiAudience
  },
  API: {
    BASE_PATH: config.api.baseUrl,
    BASE_PATH_V2: config.api.baseUrlV2,
  },
  FIREBASE: {
    API_KEY: config.firebase.apiKey,
    AUTH_DOMAIN: config.firebase.authDomain,
    DATABASE_URL: config.firebase.databaseURL,
    PROJECT_ID: config.firebase.projectId,
    STORAGE_BUCKET: config.firebase.storageBucket,
    MESSAGING_SENDER_ID: config.firebase.messagingSenderId,
    APP_ID: config.firebase.appId,
    MEASUREMENT_ID: config.firebase.measurementId,
    STORAGE_BASE_URL: config.firebase.storageBaseUrl
  }
};

export default keys;
