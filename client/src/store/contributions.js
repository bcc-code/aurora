
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
        liveDesk: [],
        feed: [],
        additionalFeed: [],
        screenFeed: [],
        feedByEvent: [],
    },
    actions: {
        bindContributionsRef: firestoreAction(context => {
            return context.bindFirestoreRef('contributions', context.getters.contributionsRef.orderBy('date', 'asc'))
        }),
        bindQueueRef: firestoreAction(context => {
            return context.bindFirestoreRef('queue', context.getters.queueRef.orderBy('approvedDate', 'asc'))
        }),
        bindLiveRef: firestoreAction(context => {
            return context.bindFirestoreRef('feed', context.getters.feedRef.orderBy('approvedDate', 'desc'))
        }),
        bindFeedRef: firestoreAction( async (context, additionalFeed = null) => {
            if (additionalFeed && additionalFeed.length > 0 && additionalFeed > 0)
                await context.bindFirestoreRef('additionalFeed', context.getters.feedByEventIdRef(additionalFeed).orderBy('publishedDate', 'desc'))
            else
                context.state.additionalFeed = [];

            return context.bindFirestoreRef('feed', context.getters.feedRef.orderBy('publishedDate', 'desc'))
        }),
        bindFeedRefByEvent: firestoreAction( async (context, screenEvent) => {
            if (!screenEvent) {
                return null
            }

            if (screenEvent.additionalFeed && screenEvent.additionalFeed.length > 0 && screenEvent.additionalFeed > 0)
                await context.bindFirestoreRef('additionalFeed', context.getters.feedByEventIdRef(screenEvent.additionalFeed).orderBy('publishedDate', 'desc'))
            else
                context.state.additionalFeed = [];

            return context.bindFirestoreRef('feedByEvent', db.collection(`events/${screenEvent.id}/feed-outgoing`));
        }),
                   
        bindDeskRef: firestoreAction(context => {
            return context.bindFirestoreRef('desk', context.getters.deskRef.orderBy('date', 'desc'))
        }),

        bindLiveDeskRef: firestoreAction(context => {
            return context.bindFirestoreRef('liveDesk', context.getters.feedRef.where("type", "==", 3).orderBy('publishedDate', 'desc'))
        }),

        addToDeskRef: firestoreAction((context, entry) => {
            return context.getters.deskRef.add(entry).then(function(docRef){docRef.update({id:`${docRef.id}`})});
        }),
        sendDeskToFeedRef: firestoreAction(async (context, entry) => {
            await context.getters.feedRef.doc(entry.id).set({ ...entry })
            return context.getters.deskRef.doc(entry.id).delete()
        }),
        updateContribsCount: firestoreAction(async (context, count) => {
            const contribCounter = await context.rootGetters['events/selectedEventRef'].collection('counters').doc('feedContributions')
            await contribCounter.update({ count: firebase.firestore.FieldValue.increment(count)})
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
            return context.getters.deskRef.doc(entry.id).update({ ...entry });
        }),
        removeDeskElementRef: firestoreAction((context, entryId) => {
            return context.getters.deskRef.doc(entryId).delete();
        }),
        updateLiveVerse: firestoreAction((context, entry) => {
            return context.getters.feedRef.doc(entry.id).update({ ...entry });
        }),
        withdrawLiveVerse: firestoreAction(async (context, entry) => {
            await context.getters.deskRef.doc(entry.id).set({ ...entry })
            return context.getters.feedRef.doc(entry.id).delete()
        }),
        removeQueueElementRef: firestoreAction((context, entryId) => {
            return context.getters.queueRef.doc(entryId).delete();
        }),
        removeLiveRef: firestoreAction((context, entry) => {
            return context.getters.feedRef.doc(entry.id).delete();
        }),

        addWasLive: firestoreAction((context, id) => {
            return context.getters.feedRef.doc(id).update({ wasLive: true })
        }),
        removeWasLive: firestoreAction((context, id) => {
            return context.getters.feedRef.doc(id).update({ wasLive: false })
        }),


    },
    getters: {
        contributionsRef: (_s, _g, _r, rootGetters) => {
            return rootGetters['events/selectedEventRef'].collection('feed-incoming')
        },
        queueRef: (_s, _g, _r, rootGetters) => {
            return rootGetters['events/selectedEventRef'].collection('feed-approved')
        },
        feedRef: (_s, _g, _r, rootGetters) => {
            return rootGetters['events/selectedEventRef'].collection('feed-outgoing')
        },
        deskRef: (_s, _g, _r, rootGetters) => {
            return rootGetters['events/selectedEventRef'].collection('desk')
        },
        latestScreenFeed: (state) => {
            return state.feedByEvent.concat(state.additionalFeed).sort((a,b) => b.publishedDate - a.publishedDate).slice(0,20);
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
        queueByEventIdRef: (state, getters, rootState, rootGetters) => (eventId) => {
            return db.collection('events').doc(eventId).collection('feed-approved')
        },
    }
}
