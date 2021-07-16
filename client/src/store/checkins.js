import { firestoreAction } from 'vuexfire'
import { db } from '@/data/db.js'

export default {
    namespaced: true,
    state: {
        checkins: [],
        screenCheckins: [],
    },
    actions: {
        bindCheckinsRef: firestoreAction(context => {
            return context.bindFirestoreRef('checkins', context.rootGetters['events/eventRef'].collection('checkins'))
        }),
        bindCheckinsScreen: firestoreAction((context, event) => {
            return context.bindFirestoreRef('screenCheckins', db.collection(`events/${event.id}/checkins`))
        }),
    },
    getters: {
        getCheckins: (_s, _g, _r, rootGetters) => (time = 0) => {
            return rootGetters['events/eventRef'].collection('checkins')
                .where('timestamp', '>=', time)
                .get()
                .then(snapshot => {
                    return snapshot.docs.map(doc => doc.data())
                })
        },
        getScreenCheckins: () => (event, time = 0) => {
            return db.collection(`events/${event.id}/checkins`)
                .where('timestamp', '>=', time)
                .get()
                .then(snapshot => {
                    return snapshot.docs.map(doc => doc.data())
                })
        },
        userCount: (_s, _g, _r, rootGetters) => {
            var currentEvent = rootGetters['events/currentEvent'];
            if (currentEvent == null)
                return 0;
            return currentEvent.checkedInUsers;
        }
    }
}
