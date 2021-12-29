import { firestoreAction  } from 'vuexfire'
import { db } from '@/data/db.js'

export default {
    namespaced: true,
    state: {
        competitions: [],
        entriesToApprove: [],
        distanceShards: [],
        distancesPerChurch: [],
        churches: [],
        checkpoints: [],
    },
    actions: {
        bindCompetitionsRef: firestoreAction(context => {
            return context.bindFirestoreRef('competitions', context.getters.competitionsRef)
        }),
        bindEntriesToApproveRef: firestoreAction(context => {
            return context.bindFirestoreRef('entriesToApprove', context.getters.entriesRef.where('distanceToBeApproved','>', 0))
        }),
        bindDistanceShardsRef: firestoreAction(context => {
            return context.bindFirestoreRef('distanceShards', context.getters.competitionRef.collection('distanceShards'))
        }),
        bindDistancesPerChurchRef: firestoreAction(context => {
            return context.bindFirestoreRef('distancesPerChurch', context.getters.competitionRef.collection('distancesPerChurch'))
        }),
        bindChurchesRef: firestoreAction(context => {
            return context.bindFirestoreRef('churches', db.collection('churches').orderBy('name'))
        }),
        bindCheckpointsRef: firestoreAction(context => {
            return context.bindFirestoreRef('checkpoints', db.collection('churches').where("step", "==", true).orderBy('stepNumber'))
        }),
        rejectEntryRef: firestoreAction((context, entry) => {
            return context.getters.entriesRef.doc(entry.id).update({ distanceToBeApproved: 0 })
        }),
        updateCompetitionRef: firestoreAction((context, competition) => {
            return context.getters.competitionsRef.doc(competition.id).update(competition)
        }),
        startCompetitionRef: firestoreAction((context, competitionId) => {
            var batch = db.batch();
            batch.update(context.rootGetters['configs/configRef'], { currentCompetition: context.getters.competitionsRef.doc(competitionId) });
            batch.update(context.rootGetters['configs/btvConfigRef'], { currentCompetition: context.getters.competitionsRef.doc(competitionId) });
            return batch.commit();
        }),
        stopCompetitionRef: firestoreAction((context) => {
            var batch = db.batch();
            batch.update(context.rootGetters['configs/configRef'], { currentCompetition: null });
            batch.update(context.rootGetters['configs/btvConfigRef'], { currentCompetition: null });
            return batch.commit();
        }),
    },
    getters: {
        competitionsRef: () => {
            return db.collection('competitions');
        },
        competition: (state, getters, rootState) => {
            if (rootState.configs.config == null)
                return null;
            return rootState.configs.config.currentCompetition;
        },
        competitionRef: (state, getters) => {
            if (getters.competition == null)
                return null;
            return getters.competitionsRef.doc(getters.competition.id)
        },
        entriesRef: (state, getters) => {
            if (getters.competitionRef == null)
                return null
            return getters.competitionRef.collection('entries')
        },
        doneDistance: (state) => {
            return state.distanceShards.reduce((acc, c) => acc + c.distance, 0);
        },
        churches: (state) => {
            let out = {}
            state.churches.forEach((c) => out[c.churchId] = c)
            return out
        },
        rankedChurchesTotalDistance: (state) => {
            return [...state.distancesPerChurch].sort((a, b) => b.distance - a.distance)
        },
        rankedChurches: (state) => {
            return [...state.distancesPerChurch].sort((a, b) => {
                var churchA = state.churches.find((church) => church.id == a.id)
                var churchB = state.churches.find((church) => church.id == b.id)
                var participantsA = churchA == null ? 10000 : parseInt(churchA.participants)
                var participantsB = churchB == null ? 10000 : parseInt(churchB.participants)
                return b.distance/participantsB - a.distance/participantsA
            })
        },
        top10: (state, getters) => {
            return getters.rankedChurches.slice(0, 10)
        },
        statsByChurchId: (state, getters) => (churchId) => {
            var church = Object.assign({}, state.churches.find((church) => church.id == churchId))
            var churchStats = state.distancesPerChurch.find((el) => el.id == churchId)
            if (churchStats == null)
                churchStats = { distance: 0 }
            church.id = churchId
            church.distance = churchStats.distance
            church.participants = church.participants == null ? 10000: parseInt(church.participants);
            church.average = (churchStats.distance / parseInt(church.participants)).toFixed(2)
            church.ranking = getters.rankedChurches.findIndex((el) => el.id == churchId) + 1
            return church
        },
        checkpoints: (state) => {
            return state.checkpoints
        }
    }
}
