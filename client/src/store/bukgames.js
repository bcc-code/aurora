import { firestoreAction  } from 'vuexfire'
import { db } from '@/data/db.js'

export default {
    namespaced: true,
    state: {
        bukGames: [],
        top50SUPERPIXEL: [],
        top50BUKRACE: []
    },
    actions: {
        bindBukGamesRef: firestoreAction(context => {
            return context.bindFirestoreRef('bukGames', context.getters.bukGamesRef)
        }),
        bindTop50SuperPixel: firestoreAction(context => {
            return context.bindFirestoreRef('top50SUPERPIXEL', context.getters.entriesRef.orderBy("SUPERPIXEL", 'desc').limit(50));
        }),
        bindTop50BukRace: firestoreAction(context => {
            return context.bindFirestoreRef('top50BUKRACE', context.getters.entriesRef.orderBy("BUKRACE", 'desc').limit(50));
        }),
    },
    getters: {
        bukGamesRef: () => {
            return db.collection('buk-games');
        },
        bukGameRef: (state, getters) => {
            return getters.bukGamesRef.doc('fktb2101')
        },
        entriesRef: (state, getters) => {
            if (getters.bukGameRef == null)
                return null
            return getters.bukGameRef.collection('entries')
        },
        top10: (state) => (game) => {
            return state[`top50${game}`].slice(0, 10)
        }
    }
}
