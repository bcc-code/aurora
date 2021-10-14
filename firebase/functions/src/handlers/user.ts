import { UserModel } from '../model/user'
import { firestore } from 'firebase-admin'
import { Request, Response } from 'express'
import { getPersonId } from '../model/utils'
import { IUser } from '../types/user'
import { logger } from '../log'

const log = logger('userHandler')

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
    log.debug("getProfileImage - start")
    const userModel = new UserModel(db)
    const personId: string | null = getPersonId(req)
    if (!personId) {
        return res.sendStatus(404).end()
    }

    const personData = await userModel.userRef(personId).get()
    const profileImageUrl = personData.data()?.ProfilePicture ?? '' // TODO: Placeholder
    log.debug("getProfileImage - end")
    return res.status(200).send({ profilePictureUrl: profileImageUrl }).end()
}

export async function getLinkedUsers(
    db: firestore.Firestore,
    req: Request,
    res: Response
) : Promise<void> {
    log.debug("getLinkedUsers - start")
    const personId = getPersonId(req)
    if (!personId) {
        return res.sendStatus(404).end()
    }

    const userModel = new UserModel(db)
    const personData = (await userModel.userRef(personId).get()).data() as IUser
    if (!personData.LinkedUserIds) {
        return res.status(200).json({LinkedUsers: []}).end()
    }

    const linkedUsers : Array<IUser> = await Promise.all(personData.LinkedUserIds.map(
        async (linkedId) => ((await userModel.userRef(linkedId.toFixed()).get()).data() as IUser)
    ))
    log.debug("getLinkedUsers - end")
    return res.status(200).json({linkedUsers}).end()
}
