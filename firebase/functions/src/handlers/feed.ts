import { EventModel } from '../model/event'
import { UserModel } from '../model/user'
import { logger } from '../log'
import { IUser } from '../types/user'
import { FeedEntry } from '../types/feed'
import { firestore } from 'firebase-admin'
import { Request, Response } from 'express'
import { getPersonId } from '../model/utils'

const log = logger('handler/feed')

export async function newFeedPost(
    db: firestore.Firestore,
    req: Request,
    res: Response
): Promise<void> {
    try {
        const eventModel = new EventModel(db, req.query.eventId)
        const userModel = new UserModel(db)
        const personId: string = getPersonId(req)
        const currentUserObj = await userModel.userRef(personId).get()
        if (!currentUserObj.exists) {
            return res
                .status(400)
                .send({ message: 'User does not exist' })
                .end()
        }
        const currentUser = currentUserObj.data() as IUser

        const churchId = currentUser.ChurchId || currentUser.churchId || null
        if (churchId !== null) {
            const churchDoc = await userModel
                .churchRef((churchId ?? '').toString())
                .get()
            if (churchDoc.exists) {
                const data = churchDoc.data()!
                currentUser.ChurchName = data.name
                currentUser.CountryName = data.country
            }
        }

        const feedEntry: FeedEntry = {
            firstName: currentUser.firstName || currentUser.FirstName || '',
            lastName: currentUser.lastName || currentUser.LastName || '',
            displayName: currentUser.displayName || currentUser.DisplayName || '',
            churchName: currentUser.churchName || currentUser.ChurchName || '',
            countryName: currentUser.countryName || currentUser.CountryName || '',
            text: req.body.text || '',
            imageUrl: req.body.imageUrl || '',
        }

        await eventModel.feed.submitFeedEntry(personId, feedEntry)
        return res.sendStatus(200).end()
    } catch (e) {
        log.error(e)
        return res.sendStatus(500).end()
    }
}
