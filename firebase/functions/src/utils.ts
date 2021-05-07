import { calculateAge, sumDeep } from "./model/utils";
import * as googleServiceKey from "../firebase-key.json";
import configRaw from "./configs/config.json";

const firebaseServiceAccount = {
  projectId: googleServiceKey.project_id,
  clientEmail: googleServiceKey.client_email,
  privateKey: googleServiceKey.private_key.replace(/\\n/g, "\n"),
};

const config = { ...(configRaw as Record<string, unknown>), firebaseServiceAccount };
export { config, calculateAge, sumDeep };
