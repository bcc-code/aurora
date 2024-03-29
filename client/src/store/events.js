import { firestoreAction  } from 'vuexfire'
import { db } from '@/data/db.js'

export default {
    namespaced: true,
    state: {
        selectedEventId: null,
        events: [],
        screenEvent: null,
    },
    mutations: {
        setSelectedEventId: (state, value) => state.selectedEventId = value,
    },
    actions: {
        bindEvents: firestoreAction(context => {
            return context.bindFirestoreRef('events', context.getters.eventsRef.orderBy('order'))
        }),
        bindScreenEvent: firestoreAction(async context => {
            return context.bindFirestoreRef('screenEvent', await context.getters.screenEventRef)
        }),
        addEvent: firestoreAction(async (context, event) => {
            const eventId = `${context.getters.nextId()}`;
            const doc = await context.getters.eventsRef.doc(eventId)
            await doc.set({ ...event })
            await doc.collection('counters').doc('feedContributions').set({ count: 0 });
            await doc.collection('counters').doc('checkins').set({
                count: 0,
                lastCountUpdate: Date.now(),
                updatePending: false,
            });
            return eventId
        }),
        updateEvent: firestoreAction((context, event) => {
            delete event.currentProgramElement;
            const template = (event.template != null && event.template.id != null) ? context.rootGetters['templates/templateById'](event.template.id) : null
            event.background.computedValue = template && event.background.useTemplate ? template.background : event.background.value || null
            event.logo.computedValue = template && event.logo.useTemplate ? template.logo : event.logo.value || null
            event.style.logo.computedValue = template && event.style.logo.useTemplate ? template.style.logo : event.style.logo.value || null
            event.style.primaryColor.computedValue = template && event.style.primaryColor.useTemplate ? template.style.primaryColor : event.style.primaryColor.value || null
            event.style.primaryColorDark.computedValue = template && event.style.primaryColorDark.useTemplate ? template.style.primaryColorDark : event.style.primaryColorDark.value || null
            event.feed.frequency = parseInt(event.feed.frequency);
            event.testimonyMaxDurationSeconds = parseInt(event.testimonyMaxDurationSeconds);
            event.nextEvent = (event.nextEvent != null) ? context.getters.eventsRef.doc(event.nextEvent.id) : null
            event.template = (event.template != null && event.template.id != null) ? context.rootGetters['templates/templatesRef'].doc(event.template.id) : null
            event.extraCheckins = +event.extraCheckins;
            event.checkinFactor = +event.checkinFactor;
            return context.getters.eventsRef.doc(event.id).update({ ...event })
        }),
        archiveEvent: firestoreAction((context, event) => {
            return context.getters.eventsRef.doc(event.id).update({ archived: true })
        }),
        restoreEvent: firestoreAction((context, event) => {
            return context.getters.eventsRef.doc(event.id).update({ archived: false })
        }),
        startEvent: firestoreAction((context, event) => {
            var batch = db.batch();
            const eventRef = context.getters.eventsRef.doc(event.id)
            batch.update(eventRef, { isActive: true });
            batch.update(context.rootGetters['configs/configRef'], { currentEventPath: eventRef });
            batch.update(context.rootGetters['configs/btvConfigRef'], { currentEventPath: eventRef });
            return batch.commit();
        }),
        endEvent: firestoreAction((context, event) => {
            var batch = db.batch();
            batch.update(context.rootGetters['configs/configRef'], { currentEventPath: null });
            batch.update(context.rootGetters['configs/btvConfigRef'], { currentEventPath: null });
            batch.update(context.getters.eventsRef.doc(event.id), { isActive: false });
            return batch.commit();
        }),
        setEventPage: firestoreAction((context, event) => {
            var batch = db.batch();
            const eventRef = event ? context.getters.eventsRef.doc(event.id) : null
            batch.update(context.rootGetters['configs/configRef'], { eventPagePath: eventRef });
            batch.update(context.rootGetters['configs/btvConfigRef'], { eventPagePath: eventRef });
            return batch.commit();
        }),
        updateBatchEvents: firestoreAction((context, events) => {
            var batch = db.batch();
            events.forEach((event) => {
                batch.update(context.getters.eventsRef.doc(event.id), { order: event.order });
            });
            return batch.commit()
        }),
    },
    getters: {
        eventsRef: () => {
            return db.collection('events')
        },

        selectedEventRef: (state, getters) => {
            return getters.eventsRef.doc(state.selectedEventId || getters.currentEvent.id)
        },

        screenEventRef: async () => {
            const config = (await db.doc("configs/screens").get()).data()
            if (!config || !config.eventId) {
                return null
            }

            return db.doc(`events/${config.eventId}`)
        },

        screenEvent: (state) => {
            return state.screenEvent;
        },

        selectedEvent: (state) => {
            return state.events.find(event => event.id == state.selectedEventId)
        },

        currentEventRef: (_s, getters, _r, _g) => {
            if (getters.currentEvent == null || getters.currentEvent.id == null)
                return null
            return db.collection('events').doc(getters.currentEvent.id)
        },

        currentEvent: (_s, _g, rootState) => {
            return rootState.configs.config.currentEventPath
        },

        eventRef: (state, getters) => {
            return state.selectedEventId ? getters.selectedEventRef : getters.currentEventRef
        },
        event: (state, getters) => {
            return state.selectedEventId ? getters.selectedEvent : getters.currentEvent
        },

        eventPage: (_s, _g, rootState) => {
            return rootState.configs.config.eventPagePath
        },

        nextId: (state) => () => {
            return  state.events.reduce((a, c) => {
                const eventId = parseInt(c.id) || 0
                return a > eventId  ? a : eventId
            }, 999) + 1
        },


    }
}
