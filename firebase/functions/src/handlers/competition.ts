import * as firebaseAdmin from "firebase-admin";
import { n, CompetitionModel } from "../model/index";
import { logger } from '../log';
import {firestore} from "firebase-admin";
import { Request, Response } from "express";

const log = logger('competition');

export async function submitCompetitionEntry(db : firestore.Firestore, req : Request, res : Response) {
  let loggedInUserPersonId = req.user[n.claims.personId]
  let personId = req.body.personId ? req.body.personId : loggedInUserPersonId;

  if (!personId) {
    return res.status(400).send({ message: `Parameter 'personId' must be set` });
  }

  if (!(req.body.distance >= 0)) {
    return res.status(400).send({ message: `Body payload parameter 'distance' must be a positive number.` });
  }

  try {
    var competitionModel = new CompetitionModel(db, firebaseAdmin.firestore.FieldValue.increment, req.query.competitionId);
    var result = await competitionModel.actions.updateEntry(personId, req.body.distance, req.body.overrideMaxDistance || 0);
    return res.json(result);
  } catch (err) {
    const msg = `error - POST /competition/entry for user ID: ${personId}`;
    log.error(msg, err);
    return res.status(500).send({ message: msg, error: err });
  }
};
