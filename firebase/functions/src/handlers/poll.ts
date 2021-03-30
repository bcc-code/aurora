import { n, EventModel } from "../model/index";
import handler, { ErrorHandler } from "./handler";
import { adminCheck, jwtCheck } from "../middleware";
import { UserModel } from "../model/user";
import { Request } from "../types";
import { NextFunction, Response } from "express";
import { logger } from '../log';
var db = null;

const pollHandler = handler();

const questionRequired = (req: Request, res: Response, next: NextFunction) => {
  if (req.query.questionId == null)
    return res.status(400).send({ message: "Required parameter 'questionId' not specified."})
  return next();
}

pollHandler.post("/generate", jwtCheck, adminCheck, async (req: Request, res) => {
  var eventModel = new EventModel(db, req.query.eventId);
  var userModel = new UserModel(db);
  var startAfter = parseInt(req.query.startAfter) || 0;
  var limit = parseInt(req.query.limit) || 100;
  var { questions, answers } = await eventModel.poll.actions.loadPollData(true);
  var userDocs = await userModel.actions.getUserDocs(limit, startAfter);

  await Promise.all(userDocs.map(async (userDoc) => {

    logger.info(`Generating poll responses for personId: ${userDoc.data().personId}`);

    await Promise.all(questions.docs.map(async (questionDoc) => {

      const personId = userDoc.data().personId;
      var responseDoc = await eventModel.poll.refs.response(personId, questionDoc.id).get();
      if (!responseDoc.exists) {

        var answersForQuestion = answers[questionDoc.id];
        if (Array.isArray(answersForQuestion) && answersForQuestion.length > 0) {
          // if not, submit answer
          const randomAnswerIndex = Math.floor(Math.random() * (answersForQuestion.length - 1));
          const randomAnswerDoc = answersForQuestion[randomAnswerIndex];

          logger.info(`generate poll response - personId: ${personId}: question '${questionDoc.id}' - answer '${randomAnswerDoc.id}'`)
          var result = await eventModel.poll.actions.setPollResponse(
            userDoc,
            questionDoc.id,
            [randomAnswerDoc.id]
          );
        }
      }
    }));
  }));
  return res.sendStatus(200);
});

pollHandler.post("/response", jwtCheck, async (req, res) => {
  const eventModel = new EventModel(db, req.query.eventId);
  const userModel = new UserModel(db);
  const userDoc = await userModel.refs.user(req.user[n.claims.personId]).get();
  await eventModel.poll.actions.setPollResponse(userDoc, req.body.questionId, req.body.selectedAnswers);
  return res.sendStatus(200);
});

pollHandler.get("/counters", async (req, res) => {
  // this method is replaced by poll-stats
  return res.json({});
});

pollHandler.post("/pickWinner", jwtCheck, adminCheck, questionRequired, async (req: Request, res) => {
  var eventModel = new EventModel(db, req.query.eventId);
  var result = await eventModel.poll.actions.pickRandomWinner(req.query.questionId);
  return res.json(result);
});

pollHandler.post("/updateStats", questionRequired, async (req, res) => {
  var eventModel = new EventModel(db, req.query.eventId);
  var result = await eventModel.poll.actions.updatePollStats(req.query.questionId);
  return res.json(result);
})

pollHandler.post("/start", jwtCheck, async (req: Request, res) => {
  if (req.body.questionIds == null) {
    return res.status(400).send({
      message: "Required parameter 'questionIds' not specified."
    })
  }
  var eventModel = new EventModel(db, req.query.eventId);
  var result = await eventModel.poll.actions.startPolls(req.body.questionIds);
  return res.json(result);
});

pollHandler.post("/clearAll", jwtCheck, async (req: Request, res) => {
    var eventModel = new EventModel(db, req.query.eventId);
    var result = await eventModel.poll.actions.pollClearAll();
    return res.json(result);
});

pollHandler.use(ErrorHandler)
export default (firebaseDb: any) => {
  db = firebaseDb;
  return pollHandler;
};
