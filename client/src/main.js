import Vue from 'vue'
import App from './App'
import { router } from './router'
import store from './store/index'
import i18n from './i18n'
import GlobalComponents from './plugins/globalComponents'
import { firestorePlugin} from 'vuefire'
import { firestoreOptions } from 'vuexfire'
import ability from '@/utils/ability'
import { abilitiesPlugin } from '@casl/vue'
import '@/assets/css/tailwind.css'
import '@fortawesome/fontawesome-free/css/all.css'

Vue.config.productionTip = false
firestoreOptions.maxRefDepth = 5;
Vue.use(abilitiesPlugin, ability)
Vue.use(firestorePlugin)
Vue.use(GlobalComponents)

Vue.mixin({
    data: function() {
        return {
            language:'no'
        }
    },
    methods: {
        showSuccess(message) {
            this.$toasted.success(this.$t(message ? message : 'messages.success'))
        },
        showError(err){
            this.$toasted.error(err ? err : this.$t('messages.error'));
        },
        isTokenExpired(error) {
            return error.response.status == 401
                && error.response.data.error.code == 'invalid_token'
                && error.response.data.error.message == 'jwt expired'
        }
    }
})

Vue.filter('capitalize', function (value) {
    if (!value) return ''
    value = value.toString()
    return value.split('-').map((v) => v.charAt(0).toUpperCase() + v.slice(1)).join(' ')
});

new Vue({
    i18n,
    store,
    router,
	render: h => h(App)
}).$mount('#aurora-app')
