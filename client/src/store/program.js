import { firestoreAction  } from 'vuexfire'
import { db } from '@/data/db'

export default {
    namespaced: true,
    state: {
        program: [],
    },
    actions: {
        bindProgramRef: firestoreAction(context => {
            return context.bindFirestoreRef('program', context.getters.programRef.orderBy('order'))
        }),
        removeProgramElementRef: firestoreAction((context, programElementId) => {
            return context.getters.programRef.doc(programElementId).delete()
        }),
        addProgramElementRef: firestoreAction((context, programElement) => {
            return context.getters.programRef.add(programElement)
        }),
        updateProgramElementRef: firestoreAction((context, programElement) => {
            return context.getters.programRef.doc(programElement.id).set({ ...programElement })
        }),
        setAsCurrentRef: firestoreAction(async (context, nextProgramElementRef) => {
            let ts = new Date();

            console.dir(nextProgramElementRef);

            const eventData = (await context.rootGetters['events/selectedEventRef'].get()).data()
            if (eventData && eventData.currentProgramElement) {
                await eventData.currentProgramElement.update({end: ts})
            }

            if (nextProgramElementRef && nextProgramElementRef.id) {
                await context.getters.programRef.doc(nextProgramElementRef.id).update({start: ts})
            }

            return context.rootGetters['events/selectedEventRef'].update({
                currentProgramElement: nextProgramElementRef == null ? null : context.getters.programRef.doc(nextProgramElementRef.id)
            });
        }),
        updateBatchProgramElementsRef: firestoreAction((context, elements) => {
            var batch = db.batch();
            elements.forEach((element) => {
                batch.update(context.getters.programRef.doc(element.id), { order: element.order });
            });
            return batch.commit()
        }),
    },
    getters: {
        programRef: (state, getters, rootState, rootGetters) => {
            return rootGetters['events/selectedEventRef'].collection('program')
        },
        currentProgramElement: (state, getters, rootState, rootGetters) => {
            var event = rootGetters['events/selectedEvent'];
            if (event == null) {
                event = rootGetters['events/currentEvent'];
            }
            return (event == null) ? null : event['currentProgramElement'];
        },
        upcoming: (state, getters) => {
            if (getters.currentProgramElement == null)
                return []
            return state.program.filter((el) => el.order >= getters.currentProgramElement.order).slice(0,8)
        }
    }
}
