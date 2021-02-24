import { firestoreAction  } from 'vuexfire'
import { db } from '@/data/db.js'

export default {
    namespaced: true,
    state: {
        selectedEventId: null,
        events: [],
    },
    mutations: {
        setSelectedEventId: (state, value) => state.selectedEventId = value,
    },
    actions: {
        bindEvents: firestoreAction(context => {
            return context.bindFirestoreRef('events', context.getters.eventsRef.orderBy('order'))
        }),
        addEvent: firestoreAction(async (context, event) => {
            const eventId = `${context.getters.nextId()}`;
            await context.getters.eventsRef.doc(eventId).set({ ...event })
            return eventId
        }),
        updateEvent: firestoreAction((context, event) => {
            delete event.currentProgramElement;
            const template = context.rootGetters['templates/templateById'](event.template.id)
            event.background.computedValue = event.background.useTemplate ? template.background : event.background.value || null
            event.logo.computedValue = event.logo.useTemplate ? template.logo : event.logo.value || null
            event.style.logo.computedValue = event.style.logo.useTemplate ? template.style.logo : event.style.logo.value || null
            event.style.primaryColor.computedValue = event.style.primaryColor.useTemplate ? template.style.primaryColor : event.style.primaryColor.value || null
            event.style.primaryColorDark.computedValue = event.style.primaryColorDark.useTemplate ? template.style.primaryColorDark : event.style.primaryColorDark.value || null
            event.syncRate = parseInt(event.syncRate);
            event.feed.frequency = parseInt(event.feed.frequency);
            event.testimonyMaxDurationSeconds = parseInt(event.testimonyMaxDurationSeconds);
            event.nextEvent = (event.nextEvent != null) ? context.getters.eventsRef.doc(event.nextEvent.id) : null
            event.template = (event.template != null) ? context.rootGetters['templates/templatesRef'].doc(event.template.id) : null
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

        eventRef: (state, getters) => {
            return state.selectedEventId ? getters.selectedEventRef : getters.currentEventRef
        },
        event: (state, getters) => {
            return state.selectedEventId ? getters.selectedEvent : getters.currentEvent
        },

        nextId: (state) => () => {
            return  state.events.reduce((a, c) => {
                const eventId = parseInt(c.id) || 0
                return a > eventId  ? a : eventId 
            }, 999) + 1
        },

        
    }
}