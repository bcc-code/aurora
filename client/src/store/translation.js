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
        bindQuestionsRef: firestoreAction(context => {
            return context.bindFirestoreRef('questions', context.getters.questionsRef.orderBy('order'))
        }),
        updateQuestionRef: firestoreAction((context, question) => {
            question.defaultAnswer = question.defaultAnswerId 
                ? context.getters.questionsRef.doc(question.id).collection('answers').doc(question.defaultAnswerId)
                : null;
            return context.getters.questionsRef.doc(question.id).set(question)
        }),
        /* ANSWERS */
        bindAnswersRef: firestoreAction((context, questionId = null) => {
            return context.bindFirestoreRef(`answers.${questionId}`, context.getters.answersRef(questionId).orderBy('order'))
        }),
        updateAnswerRef: firestoreAction((context, answer) => {
            const questionId = answer.questionId;
            delete answer.questionId;
            return context.getters.answersRef(questionId).doc(answer.id).set({ ...answer })
        }),
        /* PROGRAM */
        bindProgramRef: firestoreAction(context => {
            return context.bindFirestoreRef('program', context.getters.programRef.orderBy('order'))
        }),
        updateProgramElementRef: firestoreAction((context, programElement) => {
            return context.getters.programRef.doc(programElement.id).set({ ...programElement })
        }),
    },
    getters: {
        questionsRef: (_s, _g, _r, rootGetters) => {
            return rootGetters['events/selectedEventRef'].collection('questions')
        },
        answersRef: (_s, getters) => (questionId) => {
            return getters.questionsRef.doc(questionId).collection('answers');
        },
        programRef: (_s, _g, _r, rootGetters) => {
            return rootGetters['events/selectedEventRef'].collection('program')
        },
    }
}