<template>
    <div class="leading-tight checkins-counter">
        <div class="checkins-intro">You are watching with</div>
        <div class="checkins-count">{{userCount}}</div>
        <div class="checkins-users">friends</div>
    </div>
</template>
<script>
import { crono } from 'vue-crono'
import Api from '@/utils/api.js'
import { mapGetters, mapState } from 'vuex'
import EventBus from '@/utils/eventBus.js'
export default {
    mounted: function(){
        this.updateSyncRate(this.syncRate);
    },
    computed: {
		...mapGetters('events', ['currentEvent']),
        ...mapGetters('checkins', ['syncRate', 'userCount']),
    },
    methods: {
        async updateCheckinsNumber(){
			await Api.updateUserCount(this.currentEvent.id).catch((error) => {
                if (error.response.status == 401 
                && error.response.data.error.code == 'invalid_token'
                && error.response.data.error.message == 'jwt expired'){
                    this.$cron.stop('updateCheckinsNumber')
                    EventBus.$emit('TOKEN_EXPIRED');
                }
            })
		},
		updateSyncRate(value){
			this.$cron.time('updateCheckinsNumber', Math.max(value, 5) * 1000)
		},
    },
    watch: {
        syncRate(value){
            this.updateSyncRate(value);
        }
    },
    mixins: [crono],
    cron: {
		time: 60000,
        method: 'updateCheckinsNumber'
	}
}
</script>
<style lang="scss" scoped>

.checkins-counter {
    font-size: 32px;
    font-weight:bold;
    color:#FFF;

    &.screen-f {
        .checkins-count {
            font-size: 80px;
        }
    }

    &.world-map {
        position: absolute;
        bottom: 10%;
        z-index:999;
        text-align:left;
        left:5%;
        right:5%;
        
        .checkins-intro {
            font-size: 40px;
        }

        .checkins-count {
            font-size: 120px;
        }

        .checkins-users {
            font-size: 60px;
        }
    }
}
</style>