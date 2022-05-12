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
        res.sendStatus(404).end()
        return
    }

    const body = req.body as {
        url?: string,
        thumbnailUrl?: string
    }

    if (!body.url) {
        res.sendStatus(400)
            .json({message: "missing url"})
            .end()
        return
    }

    await userModel.updateProfileImageUrl(
        personId,
        body.url,
        body.thumbnailUrl
    )

    res.sendStatus(200).end()
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
        res.sendStatus(404).end()
        return
    }

    const personData = await userModel.userRef(personId).get()
    const profileImageUrl = personData.data()?.ProfilePicture ?? '' // TODO: Placeholder
    log.debug("getProfileImage - end")
    res.status(200).send({ profilePictureUrl: profileImageUrl }).end()
}

function getAge(dateString : string) : number{
    const today = new Date();
    const birthDate = new Date(dateString);
    const age = today.getFullYear() - birthDate.getFullYear();
    const  m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        return age - 1;
    }
    return age;
}

export async function getUserDetails(
    db: firestore.Firestore,
    req: Request,
    res: Response
) : Promise<void> {
    log.debug("getUserDetails - start")
    const personId = getPersonId(req)
    if (!personId) {
        res.sendStatus(404).end()
        return
    }

    const userModel = new UserModel(db)
    const personData = (await userModel.userRef(personId).get()).data() as IUser

    const out = {
        churchId: personData.ChurchId,
        churchName: personData.ChurchName,
        firstName: personData.FirstName,
        lastName: personData.LastName,
        birthDate: personData.Birthdate,
        age: getAge(personData.Birthdate||""),
        profilePicture: personData.ProfilePicture,
    }

    log.debug("getUserDetails - end")

    res.status(200).json(out).end()
}

export async function getLinkedUsers(
    db: firestore.Firestore,
    req: Request,
    res: Response
) : Promise<void> {
    log.debug("getLinkedUsers - start")
    const personId = getPersonId(req)
    if (!personId) {
        res.sendStatus(404).end()
        return
    }

    const userModel = new UserModel(db)
    const personData = (await userModel.userRef(personId).get()).data() as IUser
    if (!personData.LinkedUserIds || personData.LinkedUserIds.length < 1) {
        res.status(200).json({LinkedUsers: []}).end()
        return
    }

      const relatedUsers = await db.collection("users")
        .where("PersonId", "in",   personData.LinkedUserIds)
        .get();

    let linkedUsers : Array<IUser> = relatedUsers.docs.map(
        (linkedUser) => linkedUser.data() as IUser
    )

    linkedUsers = linkedUsers.filter(u => getAge(u.Birthdate || "") < 18)
    log.debug("getLinkedUsers - end")
    res.status(200).json({linkedUsers}).end()
    return
}
