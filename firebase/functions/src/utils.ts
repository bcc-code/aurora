import * as googleServiceKey from '../firebase-key.json'
import * as functions from 'firebase-functions'

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
        key: string,
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

const auroraConfig = functions.config().aurora as Record<string, unknown>
if (!auroraConfig) {
    throw new Error("Config not present")
}

const rawConfigString = auroraConfig.functionconfig as string
if (!rawConfigString) {
    throw new Error("Config not present")
}

export const config = JSON.parse(rawConfigString) as Config

export const firebaseServiceAccount = {
    projectId: googleServiceKey.project_id,
    clientEmail: googleServiceKey.client_email,
    privateKey: googleServiceKey.private_key.replace(/\\n/g, '\n'),
}

config.firebaseServiceAccount = firebaseServiceAccount;

console.log(config)

export function delay(ms: number) : Promise<void> {
    return new Promise( resolve => setTimeout(resolve, ms) );
}
