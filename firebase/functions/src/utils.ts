import { asyncForEachParallel, calculateAge, sumDeep } from "./model/utils";
import * as googleServiceKey from "../firebase-key.json";

const firebaseServiceAccount = {
  projectId: googleServiceKey.project_id,
  clientEmail: googleServiceKey.client_email,
  privateKey: googleServiceKey.private_key.replace(/\\n/g, "\n"),
};

// !!! This is being replaced in pipeline with configs/config.json, in lack of a better solution
const configFile = require("./configs/config.json");

const config = { ...configFile, firebaseServiceAccount };

export { config, asyncForEachParallel, calculateAge, sumDeep };
