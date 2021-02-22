<template>
    <li class="mb-2" @click.stop="$router.push({ name: 'template', params: { templateId : template.id } });">
        <div class="cursor-pointer list-item bg-background-2">
            <div class="flex-1 pl-1 mr-16">
                <div class="font-medium"  v-html="text"></div>
            </div>
            <div v-if="$can('delete', template)" class="overlay">
                <span class="btn btn-delete" @click.stop="showRemoveConfirm = true"><i class="fa fa-times"></i></span>
            </div>
        </div>
        <Confirm v-if="showRemoveConfirm" @cancel="showRemoveConfirm = false" @confirm="removeTemplate(template)" :message="$t('dialogs.confirm-delete-template')" />
    </li>
</template>

<script>
import { mapActions } from 'vuex'
import Confirm from '@/components/Dialogs/Confirm.vue'
export default {
    components: {
        Confirm
    },
    props: {
        template: {
            type: Object,
            required: true
        },
        searchQuery: {
            type: String,
            default: ''
        }
    },
    data: function() {
        return {
            showRemoveConfirm: false
        }
    },
    computed: {
        text() {
            return (this.searchQuery && this.searchQuery.trim()) 
                ? this.template.id.replace(new RegExp(`(${this.searchQuery})`, "gi"), "<span class='bg-blue-500 rounded-sm'>\$1</span>") 
                : this.template.id;
        },
    },
    methods: {
        ...mapActions('template', ['removeTemplate'])
    }
}
</script>