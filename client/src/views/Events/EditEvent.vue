<template>
    <OneColumn v-if="$can('update', currentEvent) && selectedEvent != null">
        <Form :entity="selectedEvent" grid :columns="2" label-root="event" class="mb-5">
            <Field name="name" type="text" />
            <Field name="details" type="text" class="col-span-2" />
            <Field name="nextEvent" type="select" allowEmpty select-label="name"
                :options="events.filter(el => el.id != selectedEvent.id)" />
            <Field name="template" type="select" allowEmpty select-label="id"
                :options="templates" />
            <Field name="additionalFeed" type="select" allowEmpty class="col-span-full"
                :options="events.filter(el => el.id != selectedEvent.id)" select-key="id" select-label="name" />
            <p class="col-span-full uppercase font-bold">{{$t('event.checkins')}}</p>
            <Field name="syncRate" type="number" />
            <Field name="totalCheckins">
                <span class="text-4xl font-bold" type="text">{{selectedEvent.checkedInUsers}}</span>
            </Field>
            <p class="col-span-full uppercase font-bold">{{$t('event.style.title')}}</p>
            <Field name="background.value" type="text" />
            <Field name="background.useTemplate" label="Use template" type="boolean" inline />
            <Field name="logo.value" type="text" />
            <Field name="logo.useTemplate" label="Use template" type="boolean" inline />
            <Field name="style.logo.value" type="textarea" />
            <Field name="style.logo.useTemplate" label="Use template" type="boolean" inline />
            <Field name="style.primaryColor.value" type="text" />
            <Field name="style.primaryColor.useTemplate" label="Use template" type="boolean" inline />
            <Field name="style.primaryColorDark.value" type="text" />
            <Field name="style.primaryColorDark.useTemplate" label="Use template" type="boolean" inline />
        </Form>
        <div class="mt-4 md:flex md:items-center md:justify-between">
            <button class="btn btn-green" type="button"
                @click="() => updateEvent(selectedEvent).then(showSuccess('messages.event-saved')).catch(showError)">
                {{$t('actions.save')}}
            </button>
            <button class="btn btn-green" type="button"
                @click="showEventTemplateName = true">
                {{$t('actions.save-as-template')}}
            </button>
            <button v-if="!isCurrent" class="btn btn-green" type="button"
                @click="startEvent(selectedEvent)">
                {{$t('actions.start')}}
            </button>
            <button v-else class="btn btn-red" type="button"
                @click="endEvent(selectedEvent)">
                {{$t('actions.end')}}
            </button>
            <button v-if="!isCurrent" class="btn btn-blue" type="button"
                @click="archiveEvent(selectedEvent).then(() => $router.push({ name: 'events' }), showSuccess('messages.event-archived')).catch(showError)">
                {{$t('actions.archive')}}
            </button>
        </div>
        <EventTemplateName v-if="showEventTemplateName" @cancel="showEventTemplateName = false" @confirm="(name) => { saveAsTemplate(name), showEventTemplateName = false }" />
    </OneColumn>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex';
import EventTemplateName from '@/components/Dialogs/EventTemplateName'
export default {
    components: {
        EventTemplateName
    },
    data: function () {
        return {
            showEventTemplateName: false
        }
    },
    computed: {
        ...mapState('events', ['events']),
        ...mapState('templates', ['templates']),
        ...mapGetters('events', ['selectedEvent', 'currentEvent']),
        isCurrent(){
            return (this.currentEvent != null 
                && this.selectedEvent != null) ? this.selectedEvent.id == this.currentEvent.id : false
        }
    },
    methods: {
        ...mapActions('events', ['updateEvent', 'archiveEvent', 'startEvent', 'endEvent']),
        ...mapActions('templates', ['createTemplateFromEvent']),
        async saveAsTemplate(templateName) {
            delete this.selectedEvent.currentProgramElement;
            this.selectedEvent.templateName = templateName;
            await this.createTemplateFromEvent(this.selectedEvent)
                .then(this.showSuccess('messages.template-saved'))
                .catch(this.showError)
        }
    },
}
</script>