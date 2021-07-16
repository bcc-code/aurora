import { firestoreAction  } from 'vuexfire'
import { db } from '@/data/db.js'
import keys from '@/utils/keys'

export default {
    namespaced: true,
    state: {
        config: {},
        screenConfig: {},
    },
    actions: {
        bindConfigRef: firestoreAction(context => {
            return context.bindFirestoreRef('config', context.getters.configRef)
        }),
        bindScreenConfigRef: firestoreAction(context => {
            return context.bindFirestoreRef('screenConfig', context.getters.screenConfigRef)
        }),
    },
    getters: {
        configRef: () => {
            return db.collection('configs').doc(keys.APP.ID)
        },
        btvConfigRef: () => {
            return db.collection('configs').doc('brunstadtv-app')
        },
        btvConfig: (state) => {
            return state.config
        },
        screenConfigRef: () => {
            return db.collection('configs').doc('screens')
        },
        screenConfig: (state) => {
            return state.screenConfig
        },
    }
}
