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

export const config = auroraConfig.functionconfig as Config
if (!config) {
    throw new Error("Config not present")
}

export function delay(ms: number) : Promise<void> {
    return new Promise( resolve => setTimeout(resolve, ms) );
}
