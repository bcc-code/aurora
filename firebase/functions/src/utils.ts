import { calculateAge } from './model/utils'
import { SecretManagerServiceClient } from '@google-cloud/secret-manager'

interface Config {
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
    }
}

let config : Config|null = null;

export async function getConfig() : Promise<Config> {
    if (!config) {
        const secretClient = new SecretManagerServiceClient();
        const [configSecret] = await secretClient.accessSecretVersion({ name: `projects/${process.env.GCLOUD_PROJECT}/secrets/firebase-config/versions/latest` })
        if (!configSecret.payload || !configSecret.payload.data) {
            throw new Error(`Unable to get secret: ${configSecret.name}`)
        }

        config = JSON.parse(configSecret.payload.data.toString()) as Config;
    }

    return config;
}


export { calculateAge }
