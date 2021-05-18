# BCC Online

Changelog can be found at [https://doc.bcc.online/changelog](https://doc.bcc.online/changelog)

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
