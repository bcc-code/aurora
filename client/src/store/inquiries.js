import { firestoreAction } from 'vuexfire'
import { db } from '@/data/db'

export default {
    namespaced: true,
    state: {
        inquiries: [],
        queue: []
    },
    actions: {
        bindInquiriesRef: firestoreAction(context => {
            return context.bindFirestoreRef('inquiries', context.getters.inquiriesRef.orderBy('date'))
        }),
        bindInquiriesQueueRef: firestoreAction(context => {
            return context.bindFirestoreRef('queue', context.getters.inquiriesQueueRef.orderBy('order'))
        }),
        toggleSendInquiriesFlag: firestoreAction(async (context, flagValue) => {
            return context.rootGetters['events/selectedEventRef'].update({ 
                canSendInquiries: flagValue
            });
        }),
        approveInquiryRef: firestoreAction(async (context, inquiry) => {
            await context.getters.inquiriesQueueRef.doc(inquiry.id).set({ ...inquiry, order: -1 })
            return context.getters.inquiriesRef.doc(inquiry.id).delete()
        }),
        showInquiryRef: firestoreAction((context, inquiryId) => {
            return context.rootGetters['events/selectedEventRef'].update({ 
                currentInquiry: inquiryId == null ? null : context.getters.inquiriesQueueRef.doc(inquiryId)
            });
        }),
        hideInquiryRef: firestoreAction((context) => {
            return context.rootGetters['events/selectedEventRef'].update({ 
                currentInquiry: null
            });
        }),
        removeInquiryRef: firestoreAction((context, inquiryId) => {
            return context.getters.inquiriesRef.doc(inquiryId).delete()
        }),
        removeInquiryFromQueueRef: firestoreAction((context, inquiryId) => {
            return context.getters.inquiriesQueueRef.doc(inquiryId).delete()
        }),
        updateBatchInquiriesRef: firestoreAction((context, inquiries) => {
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
            var event = rootGetters['events/currentEvent'];
            return (event == null) ? null : event['currentInquiry'];
        }
    }
}