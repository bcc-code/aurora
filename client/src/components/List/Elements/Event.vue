<template>
    <li class="mb-2" @click.stop="goToEvent">
        <div class="cursor-pointer list-item" :class="[isCurrent ? 'bg-downy' : 'bg-background-2']">
            <div class="list-item-order handle">{{event.order}}</div>
            <div class="flex-1 pl-1 mr-16">
                <div class="font-medium"  v-html="text"></div>
                <div class="text-gray-600 text-sm" v-html="details"></div>
            </div>
            <div v-if="$can('update', event)" class="overlay">
                <button v-if="isCurrent" class="btn btn-red" @click.stop="endEvent(event)">{{$t('actions.end')}}</button>
                <button v-else class="btn btn-green" @click.stop="startEvent(event)">{{$t('actions.start')}}</button>
                <span v-if="$can('delete', event)" class="btn btn-delete" @click.stop="showRemoveConfirm = true"><i class="fa fa-times"></i></span>
            </div>
        </div>
        <Confirm v-if="showRemoveConfirm" @cancel="showRemoveConfirm = false" @confirm="remove" :message="$t('dialogs.confirm-delete-event')" />
    </li>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import Confirm from '@/components/Dialogs/Confirm.vue'
import Api from '@/utils/api'
export default {
    components: {
        Confirm
    },
    props: {
        event: {
            type: Object,
            required: true
        },
        searchQuery: {
            type: String,
            default: ''
        }
    },
    data: function(){
        return {
            showRemoveConfirm: false
        }
    },
    computed: {
        ...mapGetters('events', ['currentEvent']),
        text() {
            return (this.searchQuery && this.searchQuery.trim()) 
                ? this.event.name.replace(new RegExp(`(${this.searchQuery})`, "gi"), "<span class='bg-seagull rounded-sm'>\$1</span>") 
                : this.event.name;
        },
        details() {
            return (this.searchQuery && this.searchQuery.trim() && this.event.details) 
                ? this.event.details.replace(new RegExp(`(${this.searchQuery})`, "gi"), "<span class='bg-seagull rounded-sm'>\$1</span>") 
                : this.event.details;
        },
        isCurrent() {
            return this.currentEvent != null && this.event.id == this.currentEvent.id;
        }
    },
    methods: {
        ...mapActions('events', ['startEvent', 'endEvent']),
        async remove(){
            await Api.deleteEvent(this.event.id)
                .then(this.showSuccess('messages.event-deleted'))
                .catch(this.showError)
        },
        goToEvent() {
            this.$router.push({ name: 'dashboard', params: { eventId : this.event.id } });
        },
    }
}
</script>