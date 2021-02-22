export default {
    methods: {
        date(timestamp){
            const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false  };
            return new Date(timestamp).toLocaleDateString('en-US', options);
        }
    }
}