import { firestoreAction } from 'vuexfire'
import { db } from '@/data/db'
import Api from '@/utils/api';

export default {
    namespaced: true,
    state: {
        selectedQuestionId: null,
        questions: [],
        answers: [],
        stats: {},
        ageStats: {},
        churchStats: {},
        eventId: null,
    },
    mutations: {
        setSelectedQuestionId: (state, value) => {
            state.selectedQuestionId = value
        }
    },
    actions: {
        /* QUESTIONS */
        bindQuestionsRef: firestoreAction(context => {
            return context.bindFirestoreRef('questions', context.getters.questionsRef.orderBy('order'))
        }),
        removeQuestionRef: firestoreAction((context, questionId) => {
            return context.getters.questionsRef.doc(questionId).delete()
        }),
        addQuestionRef: firestoreAction((context, question) => {
            return context.getters.questionsRef.doc(question.id).set(question);
        }),
        updateQuestionRef: firestoreAction((context, question) => {
            question.defaultAnswer = question.defaultAnswerId
                ? context.getters.questionsRef.doc(question.id).collection('answers').doc(question.defaultAnswerId)
                : null;
            return context.getters.questionsRef.doc(question.id).set(question)
        }),
        startQuizzRef: firestoreAction(async (context, questionIds) => {
            var eventId = context.rootState.events.selectedEventId;
            await Api.startPoll(eventId, questionIds);
        }),
        stopQuizzRef: firestoreAction(async (context) => {
            var eventId = context.rootState.events.selectedEventId;
            await Promise.all(context.rootGetters['gameboard/pollQuestions'].map(async (questionId) => {
                await Api.pickWinner(eventId, questionId);
            }))
            return context.rootGetters['gameboard/gameboardRef'].update({ poll: { questions: null, answers: null, visible: false} })
        }),
        updateBatchQuestionsRef: firestoreAction((context, questions) => {
            var batch = db.batch();
            questions.forEach((question) => {
                batch.update(context.getters.questionsRef.doc(question.id), { order: question.order });
            });
            return batch.commit()
        }),
        /* ANSWERS */
        bindAnswersRef: firestoreAction((context, questionId = null) => {
            const questionRef = questionId ? context.getters.questionsRef.doc(questionId) : context.getters.selectedQuestionRef;
            return context.bindFirestoreRef('answers', questionRef.collection('answers').orderBy('order'))
        }),
        removeAnswerRef: firestoreAction((context, answerId) => {
            return context.getters.selectedQuestionRef.collection('answers')
                .doc(answerId)
                .delete()
        }),
        addAnswerRef: firestoreAction((context, answer) => {
            return context.getters.selectedQuestionRef.collection('answers')
                .doc(answer.id)
                .set(answer)
        }),
        updateAnswerRef: firestoreAction((context, answer) => {
            return context.getters.selectedQuestionRef.collection('answers')
                .doc(answer.id)
                .set({ ...answer })
        }),
        updateBatchAnswersRef: firestoreAction((context, answers) => {
            var batch = db.batch();
            answers.forEach((answer) => {
                batch.update(context.getters.selectedQuestionRef.collection('answers').doc(answer.id), { order: answer.order });
            });
            return batch.commit()
        }),
        bindStatsRef: firestoreAction(async context => {
            return context.bindFirestoreRef('stats', await context.getters.statsRef)
        }),
        bindAgeStatsRef: firestoreAction((context, eventID) => {
            context.state.eventId = eventID
            return context.bindFirestoreRef('ageStats', context.getters.ageStatsRef)
        }),
        bindChurchStatsRef: firestoreAction((context, eventID) => {
            context.state.eventId = eventID
            return context.bindFirestoreRef('churchStats', context.getters.churchStatsStatsRef)
        }),
    },
    getters: {
        questionsRef: (_s, _g, _r, rootGetters) => {
            return rootGetters['events/selectedEventRef'].collection('questions')
        },
        selectedQuestionRef: (state, getters) => {
            return getters.questionsRef.doc(state.selectedQuestionId)
        },
        selectedQuestion: (state) => {
            return state.questions.find(question => question.id == state.selectedQuestionId)
        },
        answersByQuestionId: (_s, _g, _r, rootGetters) => async (questionId) => {
            return (await rootGetters['events/screenEventRef']).collection('questions').doc(questionId).collection('answers').orderBy('order').get().then(snapshot => {
                return snapshot.docs.map(doc => doc.data())
            });
        },
        responsesByQuestionId: (_s, _g, _r, rootGetters) => (questionId, limit) => {
            var query = rootGetters['events/screenEventRef'].collection('responses')
                .where("question", "==", questionId);
            if (limit != null) {
                query = query.limit(limit);
            }
            return query.get().then(snapshot => {
                return snapshot.docs.map(doc => doc.data())
            });
        },
        responsesByQuestionIdAndAnswerIds: (_s, _g, _r, rootGetters) => (questionId, answerIds, limit) => {
            var query = rootGetters['events/screenEventRef'].collection('responses')
                .where("question", "==", questionId)
                .where("selected", "array-contains-any", answerIds);
            if (limit != null) {
                query = query.limit(limit);
            }
            return query.get().then(snapshot => {
                return snapshot.docs.map(doc => doc.data())
            });
        },
        statsRef: async (_s, _g, _r, rootGetters) => {
            return (await rootGetters['events/screenEventRef']).collection('gameboard').doc('pollSummary')
        },
        ageStatsRef: (state, _g, _r) => {
            let r = db.doc(`events/${state.eventId}/stats/poll-by-age`)
            return r
        },
        ageStats: (state, _g, _r, _rootGetters) => {
            return state.ageStats;
        },
        churchStatsStatsRef: (state, _g, _r) => {
            let r = db.doc(`events/${state.eventId}/stats/poll-by-church`)
            return r
        },
        churchStats: (state, _g, _r, _rootGetters) => {
            return state.churchStats;
        },
    }
}
