import { firestoreAction  } from 'vuexfire'
import { db } from '@/data/db.js'

export default {
    namespaced: true,
    state: {
        selectedTemplateId: null,
        templates: []
    },
    mutations: {
        setSelectedTemplateId: (state, value) => state.selectedTemplateId = value,
    },
    actions: {
        bindTemplates: firestoreAction(context => {
            return context.bindFirestoreRef('templates', context.getters.templatesRef)
        }),
        createTemplateFromEvent: firestoreAction((context, event) => {
            const templateId = event.templateName.toLowerCase().replaceAll(' ', '-')
            return context.getters.templatesRef.doc(templateId).set({
                background: event.background.value,
                logo: event.logo.value,
                style: {
                    logo: event.style.logo.value,
                    primaryColor: event.style.primaryColor.value,
                    primaryColorDark: event.style.primaryColorDark.value
                }
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
        templateById: (state) => (templateId) => {
            return state.templates.find(t => t.id == templateId)
        }
    }
}