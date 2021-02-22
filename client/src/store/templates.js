import { firestoreAction  } from 'vuexfire'
import { db } from '@/data/db.js'

export default {
    namespaced: true,
    state: {
        selectedTemplateId: null,
        templates: []
    },
    mutations: {
        setSelectedTemplateId: (state, value) => {
            state.selectedTemplateId = value
        },
    },
    actions: {
        bindTemplatesRef: firestoreAction(context => {
            return context.bindFirestoreRef('templates', context.getters.templatesRef)
        }),
        createTemplateFromEvent: firestoreAction((context, event) => {
            const templateId = event.templateName.toLowerCase().replaceAll(' ', '-')
            return context.getters.templatesRef.doc(templateId).set({
                automaticFeedFrequency: event.automaticFeedFrequency,
                canSendInquiries: event.canSendInquiries,
                components: {
                    atmosphere: event.components.atmosphere,
                    banner: event.components.banner,
                    feed: event.components.feed,
                    livestream: event.components.livestream,
                    logoStyle: event.components.logoStyle,
                    logoUrl: event.components.logoUrl,
                    program: event.components.program,
                    testimonies: event.components.testimonies
                },
                feedApproval: event.feedApproval,
                style: event.style,
                testimonyMaxDurationSeconds: event.testimonyMaxDurationSeconds
            })
        }),
        removeTemplate: firestoreAction((context, template) => {
            return context.getters.templatesRef.doc(template.id).delete()
        }),
        updateTemplate: firestoreAction((context, template) => {
            return context.getters.templatesRef.doc(template.id).update({...template})
        })
    },
    getters: {
        templatesRef: () => {
            return db.collection('templates')
        },
        selectedTemplateRef: (state, getters) => {
            return getters.templatesRef.doc(state.selectedTemplateId)
        },
        selectedTemplate: (state) => {
            return state.templates.find(template => template.id == state.selectedTemplateId);
        },
    }
}