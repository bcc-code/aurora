import { asyncForEachParallel, calculateAge, sumDeep} from "./model/utils";

const googleServiceKey = require("../firebase-key.json");

var firebaseServiceAccount = {
  projectId: googleServiceKey.project_id,
  clientEmail: googleServiceKey.client_email,
  privateKey: googleServiceKey.private_key,
};

// !!! This is being replaced in pipeline with configs/config.json, in lack of a better solution
var configFile = require("./configs/config.json");

const config = { ...configFile, firebaseServiceAccount };

export { config, asyncForEachParallel, calculateAge, sumDeep };
