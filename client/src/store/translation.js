import { firestoreAction } from 'vuexfire'

export default {
    namespaced: true,
    state: {
        questions: [],
        answers: {},
        program: [],
    },
    actions: {
        /* QUESTIONS */
        bindQuestions: firestoreAction(context => {
            return context.bindFirestoreRef('questions', context.getters.questionsRef.orderBy('order'))
        }),
        updateQuestion: firestoreAction((context, question) => {
            question.defaultAnswer = question.defaultAnswerId 
                ? context.getters.questionsRef.doc(question.id).collection('answers').doc(question.defaultAnswerId)
                : null;
            return context.getters.questionsRef.doc(question.id).set(question)
        }),
        /* ANSWERS */
        bindAnswers: firestoreAction((context, questionId = null) => {
            return context.bindFirestoreRef(`answers.${questionId}`, context.getters.answersRef(questionId).orderBy('order'))
        }),
        updateAnswer: firestoreAction((context, answer) => {
            const questionId = answer.questionId;
            delete answer.questionId;
            return context.getters.answersRef(questionId).doc(answer.id).set({ ...answer })
        }),
        /* PROGRAM */
        bindProgram: firestoreAction(context => {
            return context.bindFirestoreRef('program', context.getters.programRef.orderBy('order'))
        }),
        updateProgramElement: firestoreAction((context, programElement) => {
            return context.getters.programRef.doc(programElement.id).set({ ...programElement })
        }),
        /* LIVEBOARD */
        bindLiveboard: firestoreAction(context => {
            return context.bindFirestoreRef('liveboard', context.getters.liveboardRef.orderBy('order'))
        }),
        updateLiveboardElement: firestoreAction((context, liveboardElement) => {
            return context.getters.liveboardRef.doc(liveboardElement.id).set({ ...liveboardElement })
        }),
    },
    getters: {
        questionsRef: (_s, _g, _r, rootGetters) => {
            return rootGetters['events/selectedEventRef'].collection('questions')
        },
        answersRef: (_s, getters) => (questionId) => {
            return getters.questionsRef.doc(questionId).collection('answers')
        },
        programRef: (_s, _g, _r, rootGetters) => {
            return rootGetters['events/selectedEventRef'].collection('program')
        },
        liveboardRef: (_s, _g, _r, rootGetters) => {
            return rootGetters['events/selectedEventRef'].collection('liveboard')
        }
    }
}