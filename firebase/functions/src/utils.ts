import * as googleServiceKey from '../firebase-key.json'
import configRaw from './configs/config.json'

interface Config {
    firebaseServiceAccount?: {
        projectId: string,
        clientEmail: string,
        privateKey: string,
    };

    auth0: {
        clientId: string,
        clientSecret: string,
        domain: string,
        apiAudience: string,
    };

    api: {
        baseUrl: string,
    };

    app: {
        instance: string,
        baseUrl: string,
        name: string,
        id: string,
        impexBucket: string,
        donationsUrl: string,
        donationsApiKey: string,
    },
    members: {
        apiKey: string,
    }
}

export const firebaseServiceAccount = {
    projectId: googleServiceKey.project_id,
    clientEmail: googleServiceKey.client_email,
    privateKey: googleServiceKey.private_key.replace(/\\n/g, '\n'),
}

export const config : Config = configRaw as Config;
config.firebaseServiceAccount = firebaseServiceAccount;

export function delay(ms: number) : Promise<void> {
    return new Promise( resolve => setTimeout(resolve, ms) );
}
