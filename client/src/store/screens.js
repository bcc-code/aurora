import { firestoreAction  } from 'vuexfire'

export default {
    namespaced: true,
    state: {
        screens: [],
        currentScreens: [],
        screenPreviewOptions: {},
    },
    mutations: {
        setScreenPreviewOptions: (state, value) => state.screenPreviewOptions = value,
    },
    actions: {
        bindScreensRef: firestoreAction(context => {
            return context.bindFirestoreRef('screens', context.getters.screensRef)
        }),
        bindCurrentScreensRef: firestoreAction(context => {
            return context.bindFirestoreRef('currentScreens', context.getters.currentScreensRef)
        }),
        createScreenRef: firestoreAction((context, newScreen) => {
            return context.rootGetters['events/eventsRef'].doc(newScreen.eventId)
                .collection('screens').doc(newScreen.screen.id).set({ ...newScreen.screen});
        }),
        updateScreenRef: firestoreAction((context, screen) => {
            return context.getters.screensRef.doc(screen.id).set({ ...screen});
        }),
        refreshScreenRef: firestoreAction((context, screenId) => {
            return context.getters.screensRef.doc(screenId).update({ refresh: true });
        }),
        refreshedScreenRef: firestoreAction((context, screenId) => {
            return context.getters.currentScreensRef.doc(screenId).update({ refresh: false, needRefresh: false });
        }),
        needRefreshScreenRef: firestoreAction((context, screenId) => {
            return context.getters.currentScreensRef.doc(screenId).update({ needRefresh: true });
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
            return state.currentScreens.find((el) => el.id == id);
        },
        currentScreensRef: (state, getters, rootState, rootGetters) => {
            if (rootGetters['events/currentEventRef'] == null)
                return null;
            return rootGetters['events/currentEventRef'].collection('screens')
        },
    }
}