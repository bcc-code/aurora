import set from 'set-value';
export default {
    props:{
        option: { type: String, required: true}
    },
    computed: {
        model: {
            get () {
                return this.resolve(this.$parent.$parent.screenOptions, this.option)
            },
            set (val) {
                set(this.$parent.$parent.screenOptions, this.option, val);
            }
        },
    },
    methods: {
        resolve(obj, path) {
            return path.split('.').reduce((o, p) => o ? o[p] : null, obj)
        }
    },
}