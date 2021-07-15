<template>
    <section class="text-2xl font-serif uppercase w-full bukgame">
        <section class="w-full flex gap-5">
            <transition-group name="flip-list" class="w-1/3" v-for="column in [0,1,2]" :key="`top-${column}`" tag="section" >
                <div class="w-full flex leading-none whitespace-no-wrap"
                    :class="[index == 0 && column == 0 ? 'h-20 pt-6 text-2xl' : 'h-10 pt-2 text-xl', (index + (column +1)%3 )%2 ? 'bg-white bg-opacity-25' : '']"
                    v-for="(user, index) in top50.slice(column == 0 ? 0 :column* 17 - 1, (column+1)*17 - 1)" :key="user.id">
                    <span class="w-1/12 pl-1 font-bold">#{{column == 0  ? index + 1 : column*17 + index}}</span>
                    <span class="w-2/12 pl-4">
                        <div class="bg-cover bg-center rounded-full" :style="{ height: '25px', width: '25px', backgroundImage: `url(${user.profilePictureThumb ? user.profilePictureThumb : '/images/buk/Nerd.png'})` }"></div>
                    </span>
                    <span class="w-7/12 mr-1 overflow-hidden">{{user.displayName}}</span>
                    <span class="w-2/12 font-bold">{{user[game]}}</span>
                </div>
            </transition-group>
        </section>
    </section>
</template>
<script>
import { mapGetters, mapState } from 'vuex'
export default {
    props: ['game'],
    computed: {
        ...mapState('bukgames', ['top50SUPERPIXEL', 'top50BUKRACE']),
        top50() {
            return this[`top50${this.game}`]
        }
    },
}
</script>
<style scoped>
table.bukgame tr:nth-child(odd) {
  @apply bg-white-15;
}

.flip-list-move {
  transition: transform 1s;
}
</style>
