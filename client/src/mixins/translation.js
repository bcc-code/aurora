import { mapState } from 'vuex'
import set from 'set-value';
export default {
    computed: {
        ...mapState('session', ['appLanguage'])
    },
    methods: {
        inLanguage(element, iso2code, fallback = false, property = 'texts') {
            const resolved = this.resolve(element, `${property}.${iso2code}`)
            return (resolved != null && resolved.length > 0) 
                ? resolved 
                : fallback ? this.resolve(element, `${property}.no`) : null
        },
        translateTo(element, iso2code, value, property = 'texts') {
            set(element, `${property}.${iso2code}`, value)
        },
        inCurrentLanguage(element, property = 'texts') {
            return this.inLanguage(element, this.appLanguage, true, property);
        },
        resolve(obj, path) {
            return path ? path.split('.').reduce((o, p) => o ? o[p] : null, obj) : obj
        }
    }
}