import { deleteCollection, sumDeep } from "../utils";
import { n, UserModel } from "../index";
import _get from 'lodash/get';
import _set from 'lodash/set';
import { isNumber } from 'lodash';
import { PollRefs, PollActions } from "../../types/poll";
import { Module } from "./module";
import { EventRefs } from "../../types/event";

export class PollModule extends Module {
  refs: PollRefs;
  actions: PollActions;

  constructor(firestore: any, increment: any, event: EventRefs) {
    super(event);
    const db = firestore;
    const userModel = new UserModel(firestore);
    
    this.refs = {};
    this.actions = {};
    
    this.refs.gameboardCol = () => this.event.event().collection(n.gameboard);
    this.refs.gameboard = () => this.event.event().collection(n.gameboard).doc("current");

    this.refs.questions = () => this.event.event().collection(n.questions);
    this.refs.question = (questionId) => this.refs.questions().doc(`${questionId}`);
    this.refs.answers = (questionId) => this.refs.question(questionId).collection(n.answers);
    this.refs.responses = () => this.event.event().collection(n.responses);
    this.refs.response = (personId, questionId) => this.refs.responses().doc(`${personId}_${questionId}`);
    this.refs.responseStats = () => this.refs.responses().doc('stats');

    this.refs.pollStats = () => this.event.event().collection(n.pollStats);
    this.refs.pollConfig = () => this.event.event().collection(n.gameboard).doc('pollConfig');
    this.refs.pollSummary = () => this.refs.gameboardCol().doc('pollSummary');
    this.refs.qaShard = (questionId, answerId, index) => this.refs.pollStats().doc(`${questionId}_${answerId}_${index}`);

    this.actions.loadPollData = async (initShards) => {
      var questions = await this.refs.questions().get();
      var answers = {};
      var answerCount = 0;
      await Promise.all(questions.docs.map(async (questionDoc) => {
        var answerList = await this.refs.answers(questionDoc.id).get();
        answers[questionDoc.id] = answerList.docs;
        answerCount += answerList.docs.length;

        if (initShards) {
          await Promise.all(answerList.docs.map(async (answerDoc) => {
            for (var i = 0; i < n.pollStatsShardCount; i++) {
              await this.refs.qaShard(questionDoc.id, answerDoc.id, i)
                .set({ total: 0 });
            }
          }));
        }
      }));
      return {
        questions,
        answers
      }
    }

    this.actions.startPolls = async (questionIds) => {
      var batch = db.batch();
      let pollQuestions = {};
      let pollAnswers = {};
      await Promise.all(questionIds.map(async (questionId) => {
        let questionRef = this.refs.question(questionId);
        let question = await questionRef.get();
        if (!question.exists) {
          throw new Error(`questionId ${questionId} does not exist`)
        }
        let answers = await this.refs.answers(questionId).get();
        if(!question.data().initialized) {
          answers.docs.forEach((answer) => {
            for (var i = 0; i < n.pollStatsShardCount; i++) {
              var shard = this.refs.qaShard(questionId, answer.id, i);
              batch.set(shard, { total: 0 });
            }
          });
          batch.update(questionRef, { initialized: true });
        }
        pollQuestions[questionId] = question.data();
        pollAnswers[questionId] = answers.docs.map((a) => a.data());
      }));
      batch.update(this.refs.gameboard(), {
        poll: {
          questions: pollQuestions,
          answers: pollAnswers,
          visible: true,
          countdown: true,
          timeLimit: 30
        },
      });
      await batch.commit();
    };

    this.actions.pollClearAll = async () => {
      await deleteCollection(db, this.refs.responses().path, 300);
      await deleteCollection(db, this.refs.pollStats().path, 300);
      await this.refs.pollSummary().set({});
    }

    this.actions.setPollResponse = async (userDoc, questionId, selectedAnswers) => {

      if (!userDoc.exists) {
        throw new Error("User not provided");
      }
      const personId = userDoc.data().personId;
      // make sure we don't already have a response for this personId + qustionId
      var responseDoc = await this.refs.response(personId, questionId).get();
      var questionDoc = await this.refs.question(questionId).get()
      if (responseDoc.exists && !questionDoc.data().canChangeAnswer) {
        throw new Error("Multiple poll responses are not permitted.");
      }
      const previousAnswers = responseDoc.exists ? responseDoc.data().selected : [];
      const configDoc = await this.refs.pollConfig().get();
      const bucketNames = configDoc.exists ? configDoc.data().bucketNames : [];

      // no existing response
      var batch = db.batch();

      const response = {
        personId: personId,
        question: questionId,
        selected: selectedAnswers,
      };

      var responseDocRef = this.refs.response(personId, questionId);

      // Select a shard of the counter based on personid
      const shardId = Math.floor(personId % 10);

      batch.set(responseDocRef, response);

      // new pollStats
      previousAnswers.forEach((answerId) => {
        batch.update(this.refs.qaShard(questionId, answerId, shardId), {
          total: increment(-1)
        }, { merge: true });
        bucketNames.forEach(bucketName => {
          var bucketValue = _get(userDoc.data(), bucketName);
          if (bucketValue == null || bucketValue == '') {
            bucketValue = 'Unknown';
          }
          var updatedDoc = {};
          updatedDoc[`${bucketName}.${bucketValue}`] = increment(-1);
          batch.update(this.refs.qaShard(questionId, answerId, shardId), updatedDoc, { merge: true });
        })
      });
      
      selectedAnswers.forEach((answerId) => {
        batch.update(this.refs.qaShard(questionId, answerId, shardId), {
          total: increment(1)
        }, { merge: true });
        bucketNames.forEach(bucketName => {
          var bucketValue = _get(userDoc.data(), bucketName);
          if (bucketValue == null || bucketValue == '') {
            bucketValue = 'Unknown';
          }
          var updatedDoc = {};
          updatedDoc[`${bucketName}.${bucketValue}`] = increment(1);
          batch.update(this.refs.qaShard(questionId, answerId, shardId), updatedDoc, { merge: true });
        })
      });

      await batch.commit();
      return responseDocRef;
    };

    this.actions.pickRandomWinner = async (questionId) => {
      const question = (await this.refs.question(questionId).get()).data();
      let candidates = [];
      let correctResponsesList;
      switch(question.type) {
        case 'multiple-choice':
          const correctAnswersList = await this.refs.answers(questionId).where("correct", "==", true).get();
          const correctAnswers = correctAnswersList.docs.map((doc) => doc.data().id);
          if(!correctAnswers || correctAnswers.length <= 0) {
            break;
          }
          correctResponsesList = await this.refs.responses().where("question", "==", questionId).where("selected", "array-contains-any", correctAnswers).get()
          candidates = correctResponsesList.docs.map((doc) => doc.data().personId);
          break;
        case 'slider':
          correctResponsesList = await this.refs.responses().where("question", "==", questionId).where("selected", "array-contains", question.slider.correct || 0).get()
          if (correctResponsesList.docs.length != 0) {
            candidates = correctResponsesList.docs.map((doc) => doc.data().personId);
            break;
          }
          candidates = (await this.refs.responses().where("question", "==", questionId).get()).docs.map((doc) => doc.data().personId);
          break;
        default:
          break;
      }
      if (candidates.length == 0) 
        return {};
      var i = Math.floor(Math.random() * candidates.length);
      var winnerPersonId = candidates[i];
      var winner = await userModel.refs.user(winnerPersonId);
      await this.refs.question(questionId).update({winner: winner});
      return true;
    }

    this.actions.updatePollStats = async (currentQuestionId) => {
      var { questions, answers } = await this.actions.loadPollData();

      var allQaShards = await this.refs.pollStats().get();
      var shards = allQaShards.docs;
      if (shards.length == 0) {
        await this.refs.pollSummary().set({});
        return {};
      }

      var total = {};
      var totalCorrect = {};
      var current = {};
      var currentTotal = {};
      var shardData = {};

      for (var i = 0; i < shards.length; i++) {
        shardData = shards[i].data();
        const [questionId, answerId, shardId] = shards[i].id.split('_');
        if (questionId == null || answerId == null) {
          console.error(`Shard '${shards[i].id}' has an error, skipping.`);
          continue;
        }
        const answersForQuestion = answers[questionId];
        if (answersForQuestion == null) {
          console.error(`Shard '${shards[i].id}' has an error, skipping.`);
          continue;
        }
        const answer = answersForQuestion.find(a => a.id == answerId);
        if (answer == null) {
          console.error(`Shard '${shards[i].id}' has an error, skipping.`);
          continue;
        }

        sumDeep(total, shardData);
        if (answer.data().correct == true) {
          sumDeep(totalCorrect, shardData);
        }

        if (questionId == currentQuestionId) {
          sumDeep(currentTotal, shardData);

          const answerWrapper = {};
          answerWrapper[answerId] = shardData;
          sumDeep(current, answerWrapper);
        }
      }
      var result = {
        total: {
          total: total,
          correct: totalCorrect
        },
        currentQuestion: current,
        currentTotal: currentTotal
      };
      await this.refs.pollSummary().set(result);
      return result;
    }

    this.actions.updateResponseStats = async (bucketPathsCommaSep, questionIdArray) => {
      var bucketPaths = typeof (bucketPathsCommaSep) === 'string' ? bucketPathsCommaSep.split(",") : [];
      var result = {
        updatingQuestion: true,
        bucketPaths: bucketPaths,
        questions: {}
      };

      await Promise.all(questionIdArray.map(async (currentQuestionId) => {

        var question = await this.refs.question(currentQuestionId).get();

        if (!question.exists) {
          console.error(`questionId '${currentQuestionId} does not exist`);
        } else {

          var answerList = await this.refs.answers(currentQuestionId).get();
          var answers = answerList.docs.map((doc) => doc.data());

          result.questions[currentQuestionId] = {
            "status": "calculating",
            "responseCount": 0,
            "answers": {}
          };

          answers.forEach(answerRef => {

            var answerValues = {
              dimensions: bucketPaths.map(bucketPath => {
                return {
                  path: bucketPath,
                  buckets: {}
                }
              })
            };
            result.questions[currentQuestionId].answers[answerRef.id] = answerValues;
          });
        }
      }));
      var responseList = await this.refs.responses().get();
      var responses = responseList.docs.map((doc) => doc.data());

      await Promise.all(responses.map(async (response) => {
        // TODO: skip responses if question not in questionIdArray
        if (questionIdArray.includes(response.question)) {
          const responseUser = await userModel.refs.user(response.personId).get();
          if (responseUser.exists) {
            bucketPaths.forEach((bucketPath, index) => {
              const userBucketValue = _get(responseUser.data(), bucketPath);
              if (userBucketValue != null && userBucketValue != '') {
                response.selected.forEach(selectedAnswer => {
                  const path = `questions.${response.question}.answers.${selectedAnswer}.dimensions.${index}.buckets.${userBucketValue}`;
                  const currentBucketValue = _get(result, path);
                  _set(result, path, !isNumber(currentBucketValue) ? 1 : currentBucketValue + 1);
                });
              }
            })
          }
        }
      }));
      await this.refs.responseStats().set(result);
      return { };
    }
  }
}