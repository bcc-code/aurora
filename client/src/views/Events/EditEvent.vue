<template>
    <OneColumn v-if="$can('update', currentEvent) && selectedEvent != null">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-1 mb-5">
            <a v-for="screen in formattedScreens" :key="screen.id" :href="`${origin}/screens/${screen.id}`"
                class="flex flex row items-start rounded-lg bg-clay p-2 hover:bg-background-2-light focus:bg-background-2-light focus:outline-none focus:shadow-outline">
                <div class="bg-bluewood text-white rounded-lg p-3 h-12 w-12 text-center">
                    <i :class="`fa fa-${screen.icon}`"></i>
                </div>
                <div class="ml-3">
                    <p class="font-semibold">{{$t('menu.screen')}} {{screen.id}}</p>
                    <p v-if="screen.component" class="text-sm">{{screen.component | capitalize}}</p>
                </div>
            </a>
        </div>
        <Form :entity="selectedEvent" grid :columns="2" label-root="event" class="mb-5">
            <Field name="name" type="text" />
            <Field name="details" type="text" class="col-span-2" />
            <Field name="nextEvent" type="select" allowEmpty select-label="name"
                :options="events.filter(el => el.id != selectedEvent.id)" />
            <Field name="template" type="select" allowEmpty select-label="id"
                :options="templates" />
            <Field name="additionalFeed" type="select" allowEmpty class="col-span-full"
                :options="events.filter(el => el.id != selectedEvent.id)" select-key="id" select-label="name" />
            <Field name="banner" type="text" />
            <p class="col-span-full uppercase font-bold">{{$t('event.checkins')}}</p>
            <Field name="totalCheckins">
                <span class="text-4xl font-bold" type="text">{{selectedEvent.checkedInUsers}}</span>
            </Field>
            <p class="col-span-full uppercase font-bold">{{$t('event.style.title')}}</p>
            <Field name="background.value" type="text" />
            <Field name="background.useTemplate" label="Use template" type="boolean" inline />
            <Field name="logo.value" type="text" />
            <Field name="logo.useTemplate" label="Use template" type="boolean" inline />
            <Field name="style.logo.value" type="textarea" label="Logo style" />
            <Field name="style.logo.useTemplate" label="Use template" type="boolean" inline />
            <Field name="style.primaryColor.value" type="text" />
            <Field name="style.primaryColor.useTemplate" label="Use template" type="boolean" inline />
            <Field name="style.primaryColorDark.value" type="text" />
            <Field name="style.primaryColorDark.useTemplate" label="Use template" type="boolean" inline />
            <Field name="extraCheckins" type="number" />
            <Field name="checkinFactor" type="number" />
        </Form>
        <div class="mt-4 md:flex md:items-center md:justify-between">
            <template v-if="!selectedEvent.archived">
                <button class="btn btn-green" type="button"
                    @click="saveEvent">
                    {{$t('actions.save')}}
                </button>
                <button class="btn btn-green" type="button"
                    @click="showEventTemplateName = true">
                    {{$t('actions.save-as-template')}}
                </button>
                <button v-if="!isEventPage" class="btn btn-blue" type="button"
                    @click="setEventPage(selectedEvent)">
                    Set as event page
                </button>
                <button v-else class="btn btn-red" type="button"
                    @click="setEventPage(null)">
                    Remove from event page
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
            </template>
            <template v-else>
                <button class="btn btn-blue" type="button"
                    @click="restoreEvent(selectedEvent).then(() => showSuccess('messages.event-restored')).catch(showError)">
                    {{$t('actions.restore')}}
                </button>
                <button class="btn btn-red" type="button"
                    @click="showDeleteConfirm = true">
                    {{$t('actions.delete')}}
                </button>
            </template>
        </div>
        <Confirm v-if="showDeleteConfirm" @cancel="showDeleteConfirm = false" @confirm="deleteEvent" :message="$t('dialogs.confirm-delete-event')" />
        <EventTemplateName v-if="showEventTemplateName" @cancel="showEventTemplateName = false" @confirm="(name) => { saveAsTemplate(name), showEventTemplateName = false }" />
    </OneColumn>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex';
import Confirm from '@/components/Dialogs/Confirm.vue'
import EventTemplateName from '@/components/Dialogs/EventTemplateName'
import Api from '@/utils/api'
export default {
    components: {
        EventTemplateName,
        Confirm
    },
    data: function () {
        return {
            showEventTemplateName: false,
            showDeleteConfirm: false,
        }
    },
    computed: {
        ...mapState('screens', ['screens']),
        ...mapState('events', ['events']),
        ...mapState('templates', ['templates']),
        ...mapGetters('events', ['selectedEvent', 'currentEvent', 'eventPage']),
        isCurrent(){
            return (this.currentEvent != null
                && this.selectedEvent != null) ? this.selectedEvent.id == this.currentEvent.id : false
        },
        isEventPage() {
            return this.eventPage != null && this.selectedEvent.id == this.eventPage.id;
        },
        formattedScreens(){
            if (this.screens != null)
                return this.screens.map((screen) => {
                    var result = { id: screen.id, component: screen.options.component};
                    switch(screen.id){
                        case 'A':
                        case 'F':
                            result.icon = 'tv';
                            break;
                        default:
                            result.icon = 'th';
                            break;
                    }
                    return result
                })
            return [{ id: 'L', icon: 'th'}, {id: 'M', icon: 'th'}, {id: 'R', icon: 'th'}, {id: 'A', icon: 'tv'}, {id: 'E', icon: 'tv'}, {id: 'F', icon: 'tv'}]
        },
        origin(){
            return window.location.origin
        },
    },
    methods: {
        ...mapActions('events', ['updateEvent', 'archiveEvent', 'startEvent', 'endEvent', 'restoreEvent', 'setEventPage']),
        ...mapActions('templates', ['createTemplateFromEvent']),
        async saveAsTemplate(templateName) {
            delete this.selectedEvent.currentProgramElement;
            this.selectedEvent.templateName = templateName;
            await this.createTemplateFromEvent(this.selectedEvent)
                .then(this.showSuccess('messages.template-saved'))
                .catch(this.showError)
        },
        async deleteEvent() {
            await Api.deleteEvent(this.selectedEvent.id)
                .then(() => {
                    this.$router.push({ name: 'events' })
                    this.showSuccess('messages.event-deleted')
                })
                .catch(this.showError)
        },
        async saveEvent() {
            let selectedEvent = this.selectedEvent;
            this.updateEvent(selectedEvent).then(async () => {
                await Api.updateUserCount(selectedEvent.id);
                this.showSuccess('messages.event-saved');
            }).catch(this.showError)
        }
    },
}
</script>
