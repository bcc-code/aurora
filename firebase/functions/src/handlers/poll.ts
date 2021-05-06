import { n } from "../model/constants";
import { EventModel } from "../model/event";
import { UserModel } from "../model/user";
import { logger } from '../log';
import {firestore} from "firebase-admin";
import { Request, Response } from "express";
import {getPersonId} from "../model/utils";

const log = logger('pollHandler');

export async function generatePoll(db : firestore.Firestore, req : Request, res : Response) : Promise<void>{
  let eventModel = new EventModel(db, req.query.eventId);
  let userModel = new UserModel(db);
  let startAfter = parseInt(req.query.startAfter) || 0;
  let limit = parseInt(req.query.limit) || 100;
  let { questions, answers } = await eventModel.poll.loadPollData(true);
  let userDocs = await userModel.getUserDocs(limit, startAfter);

  await Promise.all(userDocs.map(async (userDoc) => {

    log.info(`Generating poll responses for personId: ${userDoc.data().personId}`);

    await Promise.all(questions.docs.map(async (questionDoc) => {

      const personId = userDoc.data().personId;
      let responseDoc = await eventModel.poll.response(personId, questionDoc.id).get();
      if (!responseDoc.exists) {

        let answersForQuestion = answers[questionDoc.id];
        if (Array.isArray(answersForQuestion) && answersForQuestion.length > 0) {
          // if not, submit answer
          const randomAnswerIndex = Math.floor(Math.random() * (answersForQuestion.length - 1));
          const randomAnswerDoc = answersForQuestion[randomAnswerIndex];

          log.info(`generate poll response - personId: ${personId}: question '${questionDoc.id}' - answer '${randomAnswerDoc.id}'`)
          await eventModel.poll.setPollResponse(
            userDoc,
            questionDoc.id,
            [randomAnswerDoc.id]
          );
        }
      }
    }));
  }));
  return res.sendStatus(200).end();
}

export async function submitPollResponse(db : firestore.Firestore, req : Request, res : Response) : Promise<void>{
  const eventModel = new EventModel(db, req.query.eventId);
  const userModel = new UserModel(db);
  const userDoc = await userModel.userRef(getPersonId(req)).get();
  await eventModel.poll.setPollResponse(userDoc, req.body.questionId, req.body.selectedAnswers);
  return res.sendStatus(200).end();
};

export async function pickWinner(db : firestore.Firestore, req : Request, res : Response) : Promise<void>{
  let eventModel = new EventModel(db, req.query.eventId);
  let result = await eventModel.poll.pickRandomWinner(req.query.questionId);
  return res.json(result).end();
};

export async function updatePollStats(db : firestore.Firestore, req : Request, res : Response) : Promise<void>{
  if (req.query.questionId == null) {
    return res.status(400).send({ message: "Required parameter 'questionId' not specified."}).end();
  }

  let eventModel = new EventModel(db, req.query.eventId);
  let result = await eventModel.poll.updatePollStats(req.query.questionId);
  return res.json(result).end();
}

export async function startPoll(db : firestore.Firestore, req : Request, res : Response) : Promise<void>{
  if (req.body.questionIds == null) {
    return res.status(400).send({
      message: "Required parameter 'questionIds' not specified."
    }).end();
  }
  let eventModel = new EventModel(db, req.query.eventId);
  let result = await eventModel.poll.startPolls(req.body.questionIds);
  return res.json(result).end();
};

export async function pollClearAll(db : firestore.Firestore, req : Request, res : Response) : Promise<void>{
    let eventModel = new EventModel(db, req.query.eventId);
    let result = await eventModel.poll.pollClearAll();
    return res.json(result).end();
};

