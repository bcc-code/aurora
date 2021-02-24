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
        ...mapState('screens', ['screens']),
        ...mapState('events', ['events']),
        ...mapState('templates', ['templates']),
        ...mapGetters('events', ['selectedEvent', 'currentEvent']),
        isCurrent(){
            return (this.currentEvent != null 
                && this.selectedEvent != null) ? this.selectedEvent.id == this.currentEvent.id : false
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