import { mapActions} from 'vuex'
import stringify from 'json-stable-stringify'
export default {
    created: function() {
        Object.keys(this.screenOptions).forEach((option) => {
            if (this.isObject(this.screen.options[option]))
                this.screenOptions[option] = this.deepCopy(this.screen.options[option]);
            else this.screenOptions[option] = this.screen.options[option]
        });
    },
    computed: {
        screenOptionsDeepStringify() {
            return stringify(this.screenOptions);
        },
        hasChanged(){
            return Object.keys(this.screenOptions).some((option) => stringify(this.screenOptions[option]) != stringify(this.screen.options[option]));
        },
        updatedScreen(){
            var computedScreen = this.deepCopy(this.screen);
            computedScreen.id = this.screen.id;
            Object.keys(this.screenOptions).forEach((option) => {
                computedScreen.options[option] = this.getProperty(this.screenOptions[option])
            });
            return computedScreen
        }
    },
    methods: {
        ...mapActions('screens', ['updateScreen', 'refreshScreen']),
        isObject(obj) {
            var type = typeof obj;
            return type === 'function' || type === 'object' && !!obj;
        },
        deepCopy(obj) {
            let target = {};
            for (let prop in obj) {
                if (obj.hasOwnProperty(prop))
                    target[prop] = this.isObject(obj[prop]) ? this.deepCopy(obj[prop]) : obj[prop];
            }
            return target;
        },
        async apply(){
            if (this.hasChanged) {
                this.updateScreen(this.updatedScreen)
            }
        },
        async refresh(){
            await this.refreshScreen(this.screen.id)
        },
        getProperty(property){
            return (property == null) ? null : property;
        }
    },
    watch: {
        screenOptionsDeepStringify: {
            immediate: true,
            handler() {
                this.$store.commit('screens/setScreenPreviewOptions', this.screenOptions);
            }
        }
    }
}