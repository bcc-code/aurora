import { firestoreAction  } from 'vuexfire'
import { db } from '@/data/db'
import firebase from 'firebase'
import { ContributionTypes } from '@/models/contribution.js'

export default {
    namespaced: true,
    state: {
        contributions: [],
        queue: [],
        desk: [],
        feed: [],
        additionalFeed: []
    },
    actions: {
        bindContributionsRef: firestoreAction(context => {
            return context.bindFirestoreRef('contributions', context.getters.contributionsRef.orderBy('date', 'asc'))
        }),
        bindQueueRef: firestoreAction(context => {
            return context.bindFirestoreRef('queue', context.getters.queueRef.orderBy('approvedDate', 'asc'))
        }),
        bindFeedRef: firestoreAction( async (context, additionalFeed = null) => {
            if (additionalFeed && additionalFeed.length > 0 && additionalFeed > 0)
                await context.bindFirestoreRef('additionalFeed', context.getters.feedByEventIdRef(additionalFeed).orderBy('publishedDate', 'desc'))
            else
				context.state.additionalFeed = [];

            return context.bindFirestoreRef('feed', context.getters.feedRef.orderBy('publishedDate', 'desc'))
        }),
        bindDeskRef: firestoreAction(context => {
            return context.bindFirestoreRef('desk', context.getters.deskRef.orderBy('date', 'desc'))
        }),
        addToDeskRef: firestoreAction((context, entry) => {
            return context.getters.deskRef.add(entry);
        }),
        sendDeskToFeedRef: firestoreAction(async (context, entry) => {
            await context.getters.feedRef.doc(entry.id).set({ ...entry })
            return context.getters.deskRef.doc(entry.id).delete()
        }),
        updateContribsCount: firestoreAction(async (context, count) => {
            const contribCounter = await context.rootGetters['events/selectedEventRef'].collection('counters').doc('contributions')
            await contribCounter.set({ count: firebase.firestore.FieldValue.increment(count)})
        }),
        sendToFeedRef: firestoreAction(async (context, entry) => {
            entry.type = ContributionTypes.CONTRIBUTION;
            await context.getters.feedRef.doc(entry.id).set({ ...entry })
            return context.getters.queueRef.doc(entry.id).delete()
        }),
        approveContributionRef: firestoreAction(async (context, entry) => {
            await context.getters.queueRef.doc(entry.id).set({ ...entry })
            return context.getters.contributionsRef.doc(entry.id).delete()
        }),
        rejectContributionRef: firestoreAction((context, entry) => {
            return context.getters.contributionsRef.doc(entry.id).update({ tags: ['rejected'] })
        }),
        updateDeskElementRef: firestoreAction((context, entry) => {
            return context.getters.deskRef.doc(entry.id).set({ ...entry });
        }),
        removeDeskElementRef: firestoreAction((context, entryId) => {
            return context.getters.deskRef.doc(entryId).delete();
        }),
        removeQueueElementRef: firestoreAction((context, entryId) => {
            return context.getters.queueRef.doc(entryId).delete();
        }),
    },
    getters: {
        contributionsRef: (state, getters, rootState, rootGetters) => {
            return rootGetters['events/selectedEventRef'].collection('feed-incoming')
        },
        queueRef: (state, getters, rootState, rootGetters) => {
            return rootGetters['events/selectedEventRef'].collection('feed-approved')
        },
        feedRef: (state, getters, rootState, rootGetters) => {
            return rootGetters['events/selectedEventRef'].collection('feed-outgoing')
        },
        deskRef: (state, getters, rootState, rootGetters) => {
            return rootGetters['events/selectedEventRef'].collection('desk')
        },
        informations: (state) => {
            const infCheck = (el) => el.type == 1;
            return state.desk.filter(infCheck).concat(state.feed.filter(infCheck));
        },
        defaultTexts: (state) => {
            const f = (el) => el.type == 4;
            return state.desk.filter(f).concat(state.feed.filter(f));
        },
        latestFeed: (state, getters) => {
            return getters.feed.slice(0,20);
        },
        feed: (state) => {
            return state.feed.concat(state.additionalFeed).sort((a, b) => b.publishedDate - a.publishedDate);
        },
        feedByEventIdRef: (state, getters, rootState, rootGetters) => (eventId) => {
            return db.collection('events').doc(eventId).collection('feed-outgoing')
        },
    }
}
