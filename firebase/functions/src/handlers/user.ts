import { UserModel } from "../model/index";
import {firestore} from "firebase-admin";
import { Request, Response } from "express";
import {getPersonId} from "../model/utils";


export async function updateProfileImage(db : firestore.Firestore, req : Request, res : Response) : Promise<void>{
  let userModel = new UserModel(db);
  let personId = getPersonId(req);
  if (!personId) {
    return res.sendStatus(404).end();
  }
  await userModel.actions.updateProfileImageUrl(personId, req.body.url, req.body.thumbnailUrl);
  return res.sendStatus(200).end();
};

export async function getProfileImage(db : firestore.Firestore, req : Request, res : Response) : Promise<void>{
  let userModel = new UserModel(db);
  let personId = getPersonId(req);
  if (!personId) {
    return res.sendStatus(404).end();
  }
  const profileImageUrl = (await userModel.refs.user(personId).get()).data().profilePicture
  return res.status(200).send({ profilePictureUrl: profileImageUrl}).end();
};
