import Spinner from '@/components/Spinner.vue'
import Form from '@/components/Forms/Form.vue'
import Field from '@/components/Forms/Field.vue'
import ToggleButton from 'vue-js-toggle-button'
import VueClipboard from 'vue-clipboard2'
import Toasted from 'vue-toasted';
import OneColumn from '@/components/Layout/OneColumn'
import Title from '@/components/Layout/Title'

export default {
    install(Vue) {
        Vue.use(Toasted, { position: 'bottom-center', duration: 3000, theme: 'bubble', singleton: true })
        Vue.use(VueClipboard)
        Vue.use(ToggleButton)
        Vue.component('Spinner', Spinner)
        Vue.component('Form', Form)
        Vue.component('Field', Field)
        Vue.component('OneColumn', OneColumn)
        Vue.component('Title', Title)
    }
}
