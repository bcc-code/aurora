import { firestoreAction  } from 'vuexfire'
import { db } from '@/data/db'

export default {
    namespaced: true,
    state: {
        liveboard: [],
        components: [],
    },
    actions: {
        bindLiveboard: firestoreAction(context => {
            return context.bindFirestoreRef('liveboard', context.getters.liveboardRef.orderBy('order'))
        }),
        bindComponents: firestoreAction(context => {
            return context.bindFirestoreRef('components', context.getters.componentsRef)
        }),
        removeLiveboardElement: firestoreAction((context, liveboardElement) => {
            return context.getters.liveboardRef.doc(liveboardElement.id).delete()
        }),
        addLiveboardElement: firestoreAction((context, liveboardElement) => {
            return context.getters.liveboardRef.add(liveboardElement).then(function(docRef){docRef.update({id:`${docRef.id}`})})
        }),
        updateLiveboardElement: firestoreAction((context, liveboardElement) => {
            liveboardElement.action = liveboardElement.actionCustom || liveboardElement.actionPredefined || null
            return context.getters.liveboardRef.doc(liveboardElement.id).set({ ...liveboardElement })
        }),
        reorderLiveboardElements: firestoreAction((context, elements) => {
            var batch = db.batch();
            elements.forEach((element) => {
                batch.update(context.getters.liveboardRef.doc(element.id), { order: element.order });
            });
            return batch.commit()
        }),
    },
    getters: {
        liveboardRef: (_s, _g, _r, rootGetters) => {
            return rootGetters['events/selectedEventRef'].collection('liveboard')
        },
        componentsRef: () => {
            return db.collection('liveboard-components')
        }
    }
}