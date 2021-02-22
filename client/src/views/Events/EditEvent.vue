<template>
    <OneColumn v-if="$can('update', currentEvent) && selectedEvent != null">
        <Form :entity="selectedEvent" grid label-root="event" class="mb-5">
            <Field name="name" type="text" />
            <Field name="details" type="text" />
            <Field name="nextEvent" type="select" allowEmpty select-label="name"
                :options="events.filter(el => el.id != selectedEvent.id)" />
            <Field name="template" type="select" allowEmpty select-label="id"
                :options="templates" />
        </Form>
        <Form :entity="selectedEvent.components" class="flex flex-wrap -mx-3 mb-6" label-root="event">
            <p class="uppercase tracking-wide font-bold text-md px-4">{{$t('event.components')}}</p>
            <ul class="flex flex-col p-4 w-full">
                <li class="bg-background-2 select-none cursor-pointer rounded-md p-6 mb-2">
                    <Field name="banner" inline type="boolean" />
                    <div class="mt-4" v-if="selectedEvent.components.banner">
                        <Field name="logoUrl" type="text" />
                        <Field name="logoStyle" hideLabel type="textarea" />
                    </div>
                </li>
                <li class="bg-background-2 select-none cursor-pointer rounded-md p-6 mb-2 ">
                    <Field name="livestream" inline type="boolean" />
                    <div class="mt-4" v-if="selectedEvent.components.livestream">
                        <Field name="livestreamUrl" type="text" />
                    </div>
                </li>
                <li class="bg-background-2 select-none cursor-pointer rounded-md p-6 mb-2">
                    <Field name="program" inline type="boolean" />
                </li>
                <li class="bg-background-2 select-none cursor-pointer rounded-md p-6 mb-2">
                    <Field name="feed" inline  type="boolean" />
                    <div class="mt-4" v-if="selectedEvent.components.feed">
                        <Field name="additionalFeed" type="select" class="col-span-2 mt-2" allowEmpty :options="events.filter(el => el.id != selectedEvent.id)" select-key="id" select-label="name"/>
                    </div>
                </li>
            </ul>
        </Form>
        <Form :entity="selectedEvent" grid label-root="event">
            <p class="col-span-full uppercase font-bold">{{$t('event.checkins')}}</p>
            <Field name="syncRate" type="number" />
            <Field name="extraCheckins" type="number" />
            <Field name="totalCheckins">
                <span class="text-4xl font-bold" type="text">{{userCount}}</span>
            </Field>
            <p class="col-span-full uppercase font-bold">{{$t('event.feed')}}</p>
            <Field name="feedApproval" inline type="boolean" />
            <Field name="testimonyMaxDurationSeconds" type="number" />
            <p class="col-span-full uppercase font-bold">{{$t('event.inquiries')}}</p>
            <Field name="canSendInquiries" inline type="boolean" />
            <p class="col-span-full uppercase font-bold">{{$t('event.style.title')}}</p>
            <Field name="style.primaryColor" type="text" />
            <Field name="style.primaryColorDark" type="text" />
        </Form>
        <div class="mt-4 md:flex md:items-center md:justify-between">
            <button class="shadow bg-teal-400 hover:bg-teal-500 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded" type="button"
                @click="updateEvent">
                {{$t('actions.save')}}
            </button>
            <button class="shadow bg-teal-400 hover:bg-teal-500 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded" type="button"
                @click="showEventTemplateName = true">
                {{$t('actions.save-as-template')}}
            </button>
            <button v-if="!isCurrent" class="shadow bg-green-500 hover:bg-green-600 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded" type="button"
                @click="startEvent">
                {{$t('actions.start')}}
            </button>
            <button v-else class="shadow bg-red-500 hover:bg-red-600 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded" type="button"
                @click="endEvent">
                {{$t('actions.end')}}
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
        },
        userCount(){
            return this.selectedEvent == null ? 0 : this.selectedEvent.checkedInUsers;
        }
    },
    methods: {
        ...mapActions('events', ['updateEventRef', 'startEventRef', 'endEventRef']),
        ...mapActions('templates', ['createTemplateFromEvent']),
        async startEvent(){
            await this.startEventRef(this.selectedEvent.id);
        },
        async endEvent(){
            await this.endEventRef(this.selectedEvent.id);
        },
        async saveAsTemplate(templateName) {
            delete this.selectedEvent.currentProgramElement;
            this.selectedEvent.templateName = templateName;
            this.selectedEvent.syncRate = parseInt(this.selectedEvent.syncRate);
            this.selectedEvent.extraCheckins = parseInt(this.selectedEvent.extraCheckins);
            this.selectedEvent.automaticFeedFrequency = parseInt(this.selectedEvent.automaticFeedFrequency);
            this.selectedEvent.testimonyMaxDurationSeconds = parseInt(this.selectedEvent.testimonyMaxDurationSeconds);
            await this.createTemplateFromEvent(this.selectedEvent).then(() => {
                this.showSuccess('messages.template-saved');
            }).catch(this.showError)
        },
        async updateEvent(){
            delete this.selectedEvent.currentProgramElement;
            this.selectedEvent.syncRate = parseInt(this.selectedEvent.syncRate);
            this.selectedEvent.extraCheckins = parseInt(this.selectedEvent.extraCheckins);
            this.selectedEvent.automaticFeedFrequency = parseInt(this.selectedEvent.automaticFeedFrequency);
            this.selectedEvent.testimonyMaxDurationSeconds = parseInt(this.selectedEvent.testimonyMaxDurationSeconds);
            await this.updateEventRef(this.selectedEvent).then(() => {
                this.showSuccess('messages.event-saved');
            }).catch(this.showError)
        }
    },
}
</script>