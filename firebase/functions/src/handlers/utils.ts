import { Request, Response } from 'express'
import { getPersonId } from '../model/utils'

export function getDonationURL(req: Request, res: Response) : void {
    const personId: string | null = getPersonId(req);
    console.log(`Donation url requested for ${personId}`);

    res.json({ url: "https://donation.bcc.no/donation" }).end();
}
