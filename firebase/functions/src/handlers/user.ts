import { UserModel } from '../model/user'
import { firestore } from 'firebase-admin'
import { Request, Response } from 'express'
import { getPersonId } from '../model/utils'

export async function updateProfileImage(
    db: firestore.Firestore,
    req: Request,
    res: Response
): Promise<void> {
    const userModel = new UserModel(db)
    const personId: string | null = getPersonId(req)
    if (!personId) {
        return res.sendStatus(404).end()
    }
    await userModel.updateProfileImageUrl(
        personId,
        req.body.url,
        req.body.thumbnailUrl
    )
    return res.sendStatus(200).end()
}

export async function getProfileImage(
    db: firestore.Firestore,
    req: Request,
    res: Response
): Promise<void> {
    const userModel = new UserModel(db)
    const personId: string | null = getPersonId(req)
    if (!personId) {
        return res.sendStatus(404).end()
    }

    const personData = await userModel.userRef(personId).get()
    const profileImageUrl = personData.data()?.profilePicture ?? '' // TODO: Placeholder
    return res.status(200).send({ profilePictureUrl: profileImageUrl }).end()
}
