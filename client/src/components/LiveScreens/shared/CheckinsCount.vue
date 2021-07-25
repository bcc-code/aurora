<template>
    <div class="leading-tight checkins-counter">
        <div class="checkins-intro">You are watching with</div>
        <div class="checkins-count" v-if="event.checkedInUsers > 0">{{event.checkedInUsers}}</div>
        <div class="checkins-users">friends</div>
    </div>
</template>
<script>
export default {
    props: ['event']
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
