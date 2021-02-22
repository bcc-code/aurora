import { firestoreAction  } from 'vuexfire'
import { db } from '@/data/db.js'

export default {
    namespaced: true,
    state: {
        selectedEventId: null,
        events: [],
    },
    mutations: {
        setSelectedEventId: (state, value) => {
            state.selectedEventId = value
        },
    },
    actions: {
        bindEventsRef: firestoreAction(context => {
            return context.bindFirestoreRef('events', context.getters.eventsRef.orderBy('order'))
        }),
        removeEventRef: firestoreAction((context, eventId) => {
            return context.getters.eventsRef.doc(eventId).delete()
        }),
        addEventRef: firestoreAction(async (context, event) => {
            const eventId = `${context.getters.nextId()}`;
            await context.getters.eventsRef.doc(eventId).set({ ...event })
            return eventId
        }),
        patchEventRef: firestoreAction((context, options) => {
            return context.getters.eventsRef.doc(options.id).update(options.values)
        }),
        updateEventRef: firestoreAction((context, event) => {
            event.nextEvent = (event.nextEvent != null) ? context.getters.eventsRef.doc(event.nextEvent.id) : null
            event.template = (event.template != null) ? context.rootGetters['templates/templatesRef'].doc(event.template.id) : null
            return context.getters.eventsRef.doc(event.id).update({ ...event })
        }),
        startEventRef: firestoreAction((context, eventId) => {
            var batch = db.batch();
            const eventRef = context.getters.eventsRef.doc(eventId)
            batch.update(eventRef, { isActive: true });
            batch.update(context.rootGetters['configs/configRef'], { currentEventPath: eventRef });
            batch.update(context.rootGetters['configs/btvConfigRef'], { currentEventPath: eventRef });
            return batch.commit();
        }),
        endEventRef: firestoreAction((context, eventId) => {  
            var batch = db.batch();
            batch.update(context.rootGetters['configs/configRef'], { currentEventPath: null });
            batch.update(context.rootGetters['configs/btvConfigRef'], { currentEventPath: null });
            batch.update(context.getters.eventsRef.doc(eventId), { isActive: false });
            return batch.commit();
        }),
        updateBatchEventsRef: firestoreAction((context, events) => {
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
            return getters.eventsRef.doc(state.selectedEventId)
        },
        selectedEvent: (state) => {
            return state.events.find(event => event.id == state.selectedEventId)
        },

        currentEventRef: (state, getters, rootState, rootGetters) => {
            if (getters.currentEvent == null || getters.currentEvent.id == null)
                return null
            return db.collection('events').doc(getters.currentEvent.id)
        },
        currentEvent: (_s, _g, rootState) => {
            return rootState.configs.config.currentEventPath
        },

        nextId: (state) => () => {
            return  state.events.reduce((a, c) => {
                const eventId = parseInt(c.id) || 0
                return a > eventId  ? a : eventId 
            }, 999) + 1
        },

        
    }
}