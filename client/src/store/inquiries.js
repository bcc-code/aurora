import { firestoreAction } from 'vuexfire'
import { db } from '@/data/db'

export default {
    namespaced: true,
    state: {
        inquiries: [],
        queue: []
    },
    actions: {
        bindInquiries: firestoreAction(context => {
            return context.bindFirestoreRef('inquiries', context.getters.inquiriesRef.orderBy('date'))
        }),
        bindInquiriesQueue: firestoreAction(context => {
            return context.bindFirestoreRef('queue', context.getters.inquiriesQueueRef.orderBy('order'))
        }),
        toggleSendInquiriesFlag: firestoreAction(async (context, flagValue) => {
            return context.rootGetters['events/selectedEventRef'].update({
                canSendInquiries: flagValue
            });
        }),
        approveInquiry: firestoreAction(async (context, inquiry) => {
            await context.getters.inquiriesQueueRef.doc(inquiry.id).set({ ...inquiry, order: -1 })
            return context.getters.inquiriesRef.doc(inquiry.id).delete()
        }),
        showInquiry: firestoreAction((context, inquiry) => {
            return context.rootGetters['events/selectedEventRef'].update({
                currentInquiry: inquiry == null ? null : context.getters.inquiriesQueueRef.doc(inquiry.id)
            });
        }),
        hideInquiry: firestoreAction((context) => {
            return context.rootGetters['events/selectedEventRef'].update({ currentInquiry: null });
        }),
        removeInquiry: firestoreAction((context, inquiry) => {
            return context.getters.inquiriesRef.doc(inquiry.id).delete()
        }),
        removeInquiryFromQueue: firestoreAction((context, inquiry) => {
            return context.getters.inquiriesQueueRef.doc(inquiry.id).delete()
        }),
        updateBatchInquiries: firestoreAction((context, inquiries) => {
            var batch = db.batch();
            inquiries.forEach((inquiry) => {
                batch.update(context.getters.inquiriesQueueRef.doc(inquiry.id), { order: inquiry.order });
            });
            return batch.commit()
        }),
    },
    getters: {
        inquiriesRef: (state, getters, rootState, rootGetters) => {
            return rootGetters['events/selectedEventRef'].collection('inquiries-incoming')
        },
        inquiriesQueueRef: (state, getters, rootState, rootGetters) => {
            return rootGetters['events/selectedEventRef'].collection('inquiries-queue')
        },
        currentInquiry: (state, getters, rootState, rootGetters) => {
            var event = rootGetters['events/event'];
            return (event == null) ? null : event['currentInquiry'];
        }
    }
}
