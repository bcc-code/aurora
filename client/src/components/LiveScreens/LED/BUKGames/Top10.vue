<template>
    <section class="text-2xl font-serif uppercase w-full bukgame">
        <transition-group name="flip-list" tag="section" class="w-full">
            <div class="w-full flex leading-none whitespace-no-wrap"
                :class="[index == 0 ? 'h-25 pt-10 text-2xl' : 'h-15 pt-5 text-2xl', index%2 ? '': 'bg-white bg-opacity-25']"
                v-for="(user, index) in top10(game)" :key="user.id">
                <span class="w-1/12 pl-1 font-bold">#{{index + 1}}</span>
                <span class="w-2/12 pl-4" :class="index == 0 ? '-mt-4': '-mt-2'">
                    <div class="bg-cover bg-center rounded-full" 
                        :style="{ 
                            height: index == 0 ? '55px' : '45px', 
                            width: index == 0 ? '55px': '45px', 
                            backgroundImage: `url(${user.profilePictureThumb ? user.profilePictureThumb : '/images/buk/Nerd.png'})` 
                        }"></div>
                </span>
                <span class="w-7/12 mr-1 overflow-hidden">{{user.displayName}}</span>
                <span class="w-2/12 font-bold">{{user[game]}}</span>
            </div>
        </transition-group>
    </section>
</template>
<script>
import { mapGetters, mapState } from 'vuex'
export default {
    props: ['game'],
    computed: {
        ...mapGetters('bukgames', ['top10']),
    },
}
</script>
<style scoped>

.h-15 {
    height: 4rem;
}

.h-25 {
    height: 6rem;
}

.flip-list-move {
  transition: transform 1s;
}
</style>