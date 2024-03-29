# BCC Media Aurora System

Changelog can be found at [https://doc.aurora.bcc.media/changelog](https://doc.aurora.bcc.media/changelog)

## Getting started

* In `./client/`
  ```bash
   npm install
   npm run server
   ```
* In `./firebase/`
  * Run the following commands
   ```bash
    npm install
    cp ./firebase/functions/src/configs/config.json{.template,}
    ```
  * Edit `./firebase/functions/src/configs/config.json` to setup the secrets
  * Generate a GoogleCloud service account credentials with access to the chosen firebase project and save it as `./firebase/functions/firebase-key.json`
  * install firebase-tools (see [https://firebase.google.com/docs/cli](https://firebase.google.com/docs/cli))
  * run `firebase login`
  * run `npm run setup`
  * run `firebase init emulators`
