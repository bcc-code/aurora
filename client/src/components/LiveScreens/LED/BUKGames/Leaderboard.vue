<template>
	<section class="buk-games-bg rounded-xl w-full h-full flex relative text-left" v-if="options.game != null">
		<div class="w-full p-12 z-10">
			<div class="buk-games-header">
				<p>{{options.game == 'SUPERPIXEL' ? 'SUPER PIXEL' : 'BUK RACE'}}</p>
			</div>
			<div class="relative" v-if="loaded">
				<transition name="fade">
					<Top50 class="absolute top-0 h-full w-full"
						:game="options.game"
						v-if="showTop50"
						/>
				</transition>
				<transition name="fade">
					<Top10 v-if="!showTop50" class="absolute top-0 h-full w-full" :game="options.game"/>
				</transition>
			</div>
		</div>
	</section>
</template>
<script>
import { crono } from 'vue-crono'
import Top50 from './Top50.vue';
import Top10 from './Top10.vue';
import { mapActions } from 'vuex';
export default {
	components: {
		Top50,
		Top10
	},
	props: ['options'],
	data: function() {
		return {
			showTop50: false,
			loaded: false
		}
	},
	methods: {
		...mapActions('bukgames', ['bindTop50SuperPixel', 'bindTop50BukRace']),
		autoSwitchView(){
			this.showTop50 = !this.showTop50
		}
	},
	async created() {
		await this.bindTop50SuperPixel();
		await this.bindTop50BukRace();
		this.loaded = true;
	},
	mixins: [crono],
	cron: [
		{
			time: 5000,
			method: "autoSwitchView",
			autoStart: true
		}
	]
}
</script>
<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.8s ease;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}

.buk-games-bg {
	background: rgba(3,19,117,.7);
}

.buk-games-header {
    background: #ff3d3e;
    width: 100%;
    display: block;
    border-radius: 3px;
    color: #fff;
    text-transform: uppercase;
    font-weight: 700;
    text-align: center;
    font-size: 1.8em;
    line-height: 2em;
    outline: none;
}
</style>
