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
        bindScreens: firestoreAction(context => {
            return context.bindFirestoreRef('screens', context.getters.screensRef)
        }),
        bindCurrentScreens: firestoreAction(context => {
            return context.bindFirestoreRef('currentScreens', context.getters.currentScreensRef)
        }),
        createScreen: firestoreAction((context, newScreen) => {
            return context.rootGetters['events/eventsRef'].doc(newScreen.eventId)
                .collection('screens').doc(newScreen.screen.id).set({ ...newScreen.screen});
        }),
        updateScreen: firestoreAction((context, screen) => {
            return context.getters.screensRef.doc(screen.id).set({ ...screen});
        }),
        refreshScreen: firestoreAction((context, screenId) => {
            return context.getters.screensRef.doc(screenId).update({ refresh: true });
        }),
        refreshedScreen: firestoreAction((context, screenId) => {
            return context.getters.currentScreensRef.doc(screenId).update({ refresh: false, needRefresh: false });
        }),
        needRefreshScreen: firestoreAction((context, screenId) => {
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
            if (rootGetters['events/eventRef'] == null)
                return null;
            return rootGetters['events/eventRef'].collection('screens')
        },
    }
}