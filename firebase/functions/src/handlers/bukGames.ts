import { n, BukGameModel } from "../model/index";
import handler from "./handler";
import { jwtCheck } from "../middleware";
import { firestore } from 'firebase-admin';

var db : firestore.Firestore | null = null;

const bukGamesHandler = handler();
bukGamesHandler.get("/rank", jwtCheck, async(req, res) => {
  var bukGameModel = new BukGameModel(db, req.query.bukGameId);
  var loggedInUserPersonId = req.user[n.claims.personId]
  let userDoc = await bukGameModel.refs.entry(loggedInUserPersonId).get()
  if (!userDoc.exists) {
    return res.json(null);
  }
  let userData = userDoc.data();
  let request = bukGameModel.refs.entries()
    .orderBy(req.query.game, 'desc')
    .endAt(userData[req.query.game])
  let rank = (await request.get()).docs.length
  return res.json({...userData, rank: rank });
});

bukGamesHandler.get("/score", jwtCheck, async (req, res) => {
  var bukGameModel = new BukGameModel(db, req.query.bukGameId);
  var loggedInUserPersonId = req.user[n.claims.personId]
  let userDoc = await bukGameModel.refs.entry(loggedInUserPersonId).get()
  if (!userDoc.exists) {
    return res.json(0);
  }
  let userData = userDoc.data();
  return res.json(userData[req.query.game])
});

bukGamesHandler.get("/highscore", jwtCheck, async(req, res) => {
  var bukGameModel = new BukGameModel(db, req.query.bukGameId);
  let highScoreDoc = await bukGameModel.refs.entries()
    .orderBy(req.query.game, 'desc')
    .limit(1)
    .get()
  if (highScoreDoc.docs.length == 0) {
    return res.json(0);
  }
  let highscore = highScoreDoc.docs[0].data()[req.query.game]
  return res.json(highscore);
});

bukGamesHandler.get("/leaderboard", jwtCheck, async(req, res) => {
  var bukGameModel = new BukGameModel(db, req.query.bukGameId);
  let request = bukGameModel.refs.entries()
    .orderBy(req.query.game, 'desc')
    .limit(parseInt(req.query.limit))
  const results = (await request.get()).docs.map((el: any) => el.data());
  return res.json(results);
});

bukGamesHandler.post("/entry", jwtCheck, async (req, res) => {
  var loggedInUserPersonId = req.user[n.claims.personId]
  var personId = req.body.personId ? req.body.personId : loggedInUserPersonId;
  if (req.query.bukGameId != "fktb2101") {
    return res.status(400).send({ message: 'The bukGameId is invalid' })
  }
  if (!personId) {
    return res.status(400).send({ message: `Parameter 'personId' must be set` });
  }
  var bukGameModel = new BukGameModel(db, req.query.bukGameId);
  var userBan = await bukGameModel.refs.userBan(personId).get()
  if (userBan.exists && userBan.data().timestamp != null) {
    var timestamp = userBan.data().timestamp;
    if (timestamp > Date.now() ) {
      var secRemaining = Math.floor((timestamp - Date.now())/1000)
      var minRemaining = Math.floor((timestamp - Date.now())/60000)
      var timeRemaining = minRemaining == 0 ? `${secRemaining} seconds` : `${minRemaining} minute(s)`
      return res.status(400).send({ message: `You have been banned. Please retry in ${timeRemaining}`})
    }
    else {
      await bukGameModel.actions.unbanUser(personId)
    }
  }
  if (!(req.body.score >= 0)) {
    return res.status(400).send({ message: `You won't reach the leaderboard with a negative score buddy` });
  }
  try {
    const modulos = { SUPERPIXEL: 7, BUKRACE: 13 }
    let modulo = modulos[req.body.game]
    if (modulo == null)
      return res.status(400).send({ message: `Bro, come one...` })
    if (req.body.score%modulo) {
      await bukGameModel.actions.banUser(personId);
      return res.status(400).send({ message: `Banned`})
    }
    var result = await bukGameModel.actions.updateEntry(personId, req.body.game, req.body.score);
    return res.json(result);
  } catch (err) {
    const msg = `error - POST /buk-games/entry for user ID: ${personId}`;
    console.error(msg, `message: ${err.message}`);
    return res.status(500).send({ message: msg, error: err });
  }
});

export default (firebaseDb: any) => {
  db = firebaseDb;
  return bukGamesHandler;
};
