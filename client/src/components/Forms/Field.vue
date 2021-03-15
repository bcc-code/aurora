<template>
    <section class="form-field" :class="{'flex flex-row-reverse items-center justify-end': inline }">
        <label v-if="!hideLabel" class="form-label" :class="{ 'mb-0': inline }">{{$t(label)}}</label>
        <div :class="{ 'mt-1': !inline }">
            <input v-if="['input', 'text', 'number'].includes(type)" :type="type" class="form-input" v-model="model">
                <select v-if="type == 'select'" class="form-input" v-model="model">
                    <option v-if="allowEmpty" value=""></option>
                    <option v-for="option in options" :key="option.id" :value="resolve(option, selectKey)">
                        <span v-if="typeof selectLabel == 'function'" v-html="selectLabel(option)"></span>
                        <template v-else>{{resolve(option, selectLabel) | capitalize}}</template>
                    </option>
                </select>
                <ToggleButton v-else-if="type == 'boolean'" v-model="model" class="mr-5" />
                <textarea v-else-if="type == 'textarea'" class="form-input" v-model="model"></textarea>
                <BibleVerse v-else-if="type == 'verse'" v-model="model" />
                <slot></slot>
            </input>
        </div>
        <p class="text-gray-600 text-xs italic" v-if="helper">{{helper}}</p>
    </section>
</template>

<script>
import set from 'set-value';
import Question from '../List/Elements/Question.vue';
import BibleVerse from './BibleVerse.vue';
export default {
  components: { Question, BibleVerse },
    props: {
        // General props
        name: { type: String, required: true },
        hideLabel: { type: Boolean, default: false },
        label: { type: String, default: function () { return `${this.$parent.labelRoot}.${this.name}` }},
        inline: { type: Boolean, default: false },
        helper: { type: String, required: false },
        type: { type: String, required: false },
        // Select/Lookup props
        options: { type: Array | Object, required: false },
        allowEmpty: { type: Boolean, default: false },
        selectKey: { type: String, required: false },
        selectLabel: { type: String | Function, required: false },
    },
    computed: {
        model: {
            get () {
                return this.resolve(this.$parent.entity, this.name)
            },
            set (val) {
                set(this.$parent.entity, this.name, val);
            }
        },
    },
    methods: {
        resolve(obj, path) {
            return path ? path.split('.').reduce((o, p) => o ? o[p] : null, obj) : obj
        }
    }
}
</script>
<style scoped>
textarea {
    @apply h-48;
    @apply resize-none;
    @apply appearance-none;
}
</style>
