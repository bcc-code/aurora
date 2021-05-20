import { Request, Response } from 'express'
import { getPersonId } from '../model/utils'
import * as gaxios from 'gaxios'

export async function getDonationURL(req: Request, res: Response) : Promise<void> {
    const personId: string | null = getPersonId(req);
    console.log(`Donation url requested for ${personId}`);

    const url = 'https://donation-api-stage.azurewebsites.net/api/Authenticate/AuthenticatedUrl'

    const result = await gaxios.request({
        method: 'POST',
        url,
        headers: {
            Authorization: req.headers.authorization,
        },
    });

    console.log(result);

    res.json({ url: "https://donation.bcc.no/donation" }).end();
}
