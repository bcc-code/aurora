import { firestoreAction } from 'vuexfire'
export default {
    namespaced: true,
    state: {
        checkins: [],
    },
    actions: {
        bindCheckinsRef: firestoreAction(context => {
            return context.bindFirestoreRef('checkins', context.rootGetters['events/currentEventRef'].collection('checkins'))
        }),
    },
    getters: {
        syncRate: (_s, _g, _r, rootGetters) => {
            var currentEvent = rootGetters['events/currentEvent'];
            return currentEvent == null ? null : currentEvent.syncRate;
        },
        getCheckins: (_s, _g, _r, rootGetters) => (time = 0) => {
            return rootGetters['events/currentEventRef'].collection('checkins')
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