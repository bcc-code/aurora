import Vue from "vue"
import English from './localization/en.json'
import VueI18n from 'vue-i18n'

Vue.use(VueI18n)

const messages = {
    en: English,
}

export default new VueI18n({
    locale: 'en',
	fallbackLocale: 'en',
	messages
});
