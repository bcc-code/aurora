import { mapState } from 'vuex'
export default {
    computed: {
        ...mapState('session', ['appLanguage'])
    },
    methods: {
        inLanguage(element, iso2code, fallback = false) {
            return (iso2code in element.texts && element.texts[iso2code] != null && element.texts[iso2code].length > 0)
                ? element.texts[iso2code] 
                : fallback ? element.texts['no'] : null;
        },
        translateTo(element, iso2code, value) {
            element.texts[iso2code] = value;
        },
        inCurrentLanguage(element) {
            return this.inLanguage(element, this.appLanguage, true);
        }
    }
}