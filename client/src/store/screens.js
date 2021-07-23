import { firestoreAction  } from 'vuexfire'
import { db } from '@/data/db.js'

export default {
    namespaced: true,
    state: {
        screens: [],
        currentScreens: [],
        activeScreens: [],
        screenPreviewOptions: {},
    },
    mutations: {
        setScreenPreviewOptions: (state, value) => state.screenPreviewOptions = value,
    },
    actions: {
        bindScreens: firestoreAction(context => {
            return context.bindFirestoreRef('screens', context.getters.screensRef)
        }),
        bindCurrentScreens: firestoreAction(context => {
            return context.bindFirestoreRef('currentScreens', context.getters.currentScreensRef)
        }),
        bindActiveScreens: firestoreAction(async context => {
            const config = (await context.rootGetters['configs/screenConfigRef'].get()).data()
            const screens = db.collection(`events/${config.eventId}/screens`)
            return context.bindFirestoreRef('activeScreens', screens);
        }),
        createScreen: firestoreAction((context, newScreen) => {
            return context.rootGetters['events/eventsRef'].doc(newScreen.eventId)
                .collection('screens').doc(newScreen.screen.id).set({ ...newScreen.screen});
        }),
        updateScreen: firestoreAction((context, screen) => {
            return context.getters.screensRef.doc(screen.id).set({ ...screen});
        }),
        refreshScreen: firestoreAction((context, eventId, screenId) => {
            return db.doc(`events/${eventId}/screens/${screenId}`).update({ refresh: true });
        }),
        refreshedScreen: firestoreAction((context, eventId, screenId) => {
            return db.doc(`events/${eventId}/screens/${screenId}`).update({ refresh: false, needRefresh: false });
        }),
        needRefreshScreen: firestoreAction((context, eventId, screenId) => {
            return db.doc(`events/${eventId}/screens/${screenId}`).update({ needRefresh: true });
        })
    },
    getters: {
        screensRef: (state, getters, rootState, rootGetters) => {
            return rootGetters['events/selectedEventRef'].collection('screens')
        },
        screenFromId: (state) => (id) => {
            return state.screens.find((el) => el.id == id);
        },
        currentScreenFromId: (state) => (id) => {
            return state.activeScreens.find((el) => el.id == id);
        },
        screenRefFromId: () => (eventId, screenId) => {
            return db.doc(`events/${eventId}/screens/${screenId}`)
        },
        currentScreensRef: (state, getters, rootState, rootGetters) => {
            if (rootGetters['events/eventRef'] == null)
                return null;
            return rootGetters['events/eventRef'].collection('screens')
        },
    }
}
