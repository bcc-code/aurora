<template>
    <li class="mb-2" @click="() => { if (!editing) $emit('edit') }">
        <Form v-if="editing" class="bg-mirage p-4 mb-3" grid :columns="3" :entity="element" label-root="liveboard">
            <Field name="icon" type="select" :options="icons" />
            <Field :name="`title.${language}`" label="title" type="text" />
            <Field :name="`description.${language}`" label="description" type="text" />
            <p class="font-bold col-span-full">Background</p>
            <Field name="background.image" type="text" />
            <Field name="background.gradient.from" type="text" />
            <Field name="background.gradient.to" type="text" />
            <p class="font-bold col-span-full">Action</p>
            <Field name="actionPredefined" type="select" :options="actions" />
            <Field name="actionCustom" type="text" />
            <Field :name="`label.${language}`" label="label" type="text" />
            <button class="col-start-1 btn btn-green" @click.stop="updateLiveboardElement(element)"><i class="fas fa-save"></i></button>
            <button class="btn btn-red" @click.stop="removeLiveboardElement(element)"><i class="fas fa-trash"></i></button>
        </Form>
        <LiveboardPreview :element="element" />
    </li>
</template>

<script>
import { mapActions } from 'vuex'
import LiveboardPreview from './LiveboardPreview'
import Translations from '@/mixins/translation.js'
export default {
    components: { LiveboardPreview },
    props: {
        element: {
            type: Object,
            required: true
        },
        editing: {

        }
    },
    mixins: [Translations],
    data: function () {
        return {
            icons: ['icon'],
            actions: ['event_post']
        }
    },
    computed: {

    },
    methods: {
        ...mapActions('liveboard', ['updateLiveboardElement', 'removeLiveboardElement']),

    }
}
</script>
<style>
.preview {
    border: 1px solid rgba(204, 221, 255, 0.0980392);
    box-sizing: border-box;
    border-radius: 12px;
}

.preview-button {
    border: 1px solid rgba(204, 221, 255, 0.0980392);
    box-sizing: border-box;
    border-radius: 20px;
}
</style>