import { Request, Response } from 'express'
import { getPersonId } from '../model/utils'
import * as gaxios from 'gaxios'
import { logger } from '../log'
import { config } from '../utils'

const log = logger('utilsHandler')

export async function getDonationURL(req: Request, res: Response) : Promise<void> {
    const personId: string | null = getPersonId(req);

    const url = config.app.donationsUrl
    const token = Buffer.from(`${config.app.donationsApiKey}:${personId}`).toString('base64')

    let outUrl = "https://donation.bcc.no/"
    try {
        const result = await gaxios.request({
            method: 'POST',
            timeout: 5000, // We wait at most 5 seconds
            url,
            headers: {
                'x-api-key': token,
            },
        });

        outUrl = result.data as string ?? outUrl;
    } catch (e) {
        log.error(e)
    } finally {
        res.json({ url: outUrl }).end();
    }
}

// TODO: This is just for purposes of integrating the app. It needs to be made functional
export async function getSignedRedirect(
    db: firestore.Firestore,
    req: Request,
    res: Response
) : Promise<void> {
    log.debug("getSignedRedirect - start")
    const data = req.query["data"];

    const token = req.header("authorization")?.replace("Bearer ", "");

    try {
        const result = await gaxios.request({
            method: 'GET',
            timeout: 5000, // We wait at most 5 seconds
            url: `https://api.pro.online.bcc.media/api/dynamiclink?data=${data}`, // Yes, I know. Not now!
            headers: {
                'Authorization': token,
            },
        });

        res.status(200).json((result.data as Record<string, unknown>).url);
    } catch(e) {
        log.error(e);
        res.status(200).json(`https://brunstad.tv`)
    }

    log.debug("getSignedRedirect - end")
}

