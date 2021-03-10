<template>
    <li class="mb-2" @click="() => { if (!editing) $emit('edit') }">
        <Form v-if="editing" class="bg-mirage p-4 mb-3" grid :columns="3" :entity="element" label-root="liveboard">
            <Field :name="`title.${language}`" label="title" type="text" />
            <Field :name="`description.${language}`" label="description" type="text" />
            <p class="font-bold col-span-full">Icon</p>
            <Field name="icon.name" type="select" :options="icons" />
            <Field name="icon.color" type="select" :options="colors" selectKey="value" selectLabel="label" />
            <p class="font-bold col-span-full">Background</p>
            <Field name="background.image" type="text" />
            <Field name="background.gradient.from" type="text" />
            <Field name="background.gradient.to" type="text" />
            <p class="font-bold col-span-full">Button</p>
            <Field name="button.action" type="select" :options="actions" />
            <Field name="button.url" class="col-span-2" type="text" />
            <Field :name="`button.label.${language}`" label="liveboard.button.label" type="text" />
            <Field name="button.color" type="select" :options="colors" selectKey="value" selectLabel="label" />
            <button class="col-start-1 btn btn-green" @click.stop="updateLiveboardElement(element), $emit('close')"><i class="fas fa-save"></i></button>
            <button class="btn btn-red" @click.stop="removeLiveboardElement(element)"><i class="fas fa-trash"></i></button>
        </Form>
        <LiveboardPreview class="handle" :element="element" />
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
            type: Boolean,
            default: false
        }
    },
    mixins: [Translations],
    data: function () {
        return {
            icons: ['book', 'camera', 'cycling', 'explore', 'feed', 'fire', 'game', 'happy', 'heart', 'information', 'location', 'post', 'question', 'running', 'support', 'survey', 'url', 'video'],
            actions: ['post', 'feed', 'testimony', 'inquiry', 'quizz', 'url', 'deeplink'],
            colors: [{ label: 'white', value: '#fff' }, { label: 'blue', value:'#6eb0e6' }, { label: 'red', value: '#e63c62' }]
        }
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