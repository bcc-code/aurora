import { BukGameModel } from "../model/bukGame";
import { logger } from '../log';
import {firestore} from "firebase-admin";
import { Request, Response } from "express";
import {getPersonId} from "../model/utils";

const log = logger('bukGamesHandler');

//bukGamesHandler.get("/rank", jwtCheck, async(req, res) => {
export async function getRank(db : firestore.Firestore,req : Request, res : Response) : Promise<void> {
  const bukGameModel = new BukGameModel(db, req.query.bukGameId);
  const loggedInUserPersonId = getPersonId(req);
  const userDoc = await bukGameModel.entry(loggedInUserPersonId).get()
  if (!userDoc.exists) {
    return res.json(null).end();
  }
  const userData = userDoc.data();
  const request = bukGameModel.entries
    .orderBy(req.query.game, 'desc')
    .endAt(userData![req.query.game])
  const rank = (await request.get()).docs.length
  return res.json({...userData, rank: rank }).end();
}

//bukGamesHandler.get("/score", jwtCheck, async (req, res) => {
export async function getScore(db : firestore.Firestore,req : Request, res : Response) : Promise<void> {
  const bukGameModel = new BukGameModel(db, req.query.bukGameId);
  const loggedInUserPersonId = getPersonId(req);
  if (!loggedInUserPersonId) {
    return res.json(0).end();
  }
  const userDoc = await bukGameModel.entry(loggedInUserPersonId).get()
  if (!userDoc.exists) {
    return res.json(0).end();
  }
  const userData = userDoc.data()!;
  return res.json(userData[req.query.game]).end()
}

//bukGamesHandler.get("/highscore", jwtCheck, async(req, res) => {
export async function getHighScore(db : firestore.Firestore,req : Request, res : Response) : Promise<void> {
  const bukGameModel = new BukGameModel(db, req.query.bukGameId);
  const highScoreDoc = await bukGameModel.entries
    .orderBy(req.query.game, 'desc')
    .limit(1)
    .get()
  if (highScoreDoc.docs.length === 0) {
    return res.json(0).end();
  }
  const highscore = highScoreDoc.docs[0].data()[req.query.game]
  return res.json(highscore).end();
}

//bukGamesHandler.get("/leaderboard", jwtCheck, async(req, res) => {
export async function getLeaderboard(db : firestore.Firestore,req : Request, res : Response) : Promise<void> {
  const bukGameModel = new BukGameModel(db, req.query.bukGameId);
  const request = bukGameModel.entries
    .orderBy(req.query.game, 'desc')
    .limit(parseInt(req.query.limit))
  const results = (await request.get()).docs.map((el: any) => el.data());
  return res.json(results).end();
}

// bukGamesHandler.post("/entry", jwtCheck, async (req, res) => {
export async function addEntry(db : firestore.Firestore,req : Request, res : Response) : Promise<void> {
  const loggedInUserPersonId = getPersonId(req);
  const personId = loggedInUserPersonId; //req.body.personId ? req.body.personId : loggedInUserPersonId;
  if (req.query.bukGameId !== "fktb2101") {
    return res.status(400).send({ message: 'The bukGameId is invalid' }).end()
  }
  if (!personId) {
    return res.status(400).send({ message: `Parameter 'personId' must be set` }).end();
  }

  const bukGameModel = new BukGameModel(db, req.query.bukGameId);
  const userBan = await bukGameModel.userBan(personId).get()
  if (userBan.exists && userBan.data()!.timestamp !== null) {
    const timestamp = userBan.data()!.timestamp;
    if (timestamp > Date.now() ) {
      const secRemaining = Math.floor((timestamp - Date.now())/1000)
      const minRemaining = Math.floor((timestamp - Date.now())/60000)
      const timeRemaining = minRemaining === 0 ? `${secRemaining} seconds` : `${minRemaining} minute(s)`
      return res.status(400).send({ message: `You have been banned. Please retry in ${timeRemaining}`}).end();
    }
    else {
      await bukGameModel.unbanUser(personId)
    }
  }
  if (!(req.body.score >= 0)) {
    return res.status(400).send({ message: `You won't reach the leaderboard with a negative score buddy` }).end();
  }

  try {
    let modulo = -1;
    switch(req.body.game) {
      case "SUPERPIXEL":
        modulo = 7; break;
      case "BUKRACE":
        modulo = 13; break;
      default:
        return res.status(400).send({ message: `Bro, come on...` }).end();
    }

    if (req.body.score%modulo !== 0) {
      await bukGameModel.banUser(personId);
      return res.status(400).send({ message: `Banned`}).end();
    }

    const result = await bukGameModel.updateEntry(personId, req.body.game, req.body.score);
    return res.json(result).end();

  } catch (err) {
    const msg = `error - POST /buk-games/entry for user ID: ${personId}`;
    log.error(msg, err);
    return res.status(500).send({ message: msg, error: err }).end();
  }
}
