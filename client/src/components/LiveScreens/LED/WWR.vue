<template>
	<section class="w-full h-full blue-gradient">
        <div class="w-full flex justify-start">
            <Globe :width="width" :height="height" :options="globeOptions" allow-wheel-zoom capture />
            <div class="w-1/2 py-12 pl-24 z-10">
                <Title />
                <div class="relative">
                    <transition-group name="fade">
                        <ChurchDetails class="absolute top-0 h-full w-full px-12" key="detail"
                            v-if="focusedChurch != null"
                            @close="selectedChurch = null"
                            :church="focusedChurch" />
                        <Leaderboard class="absolute top-0 h-full w-full px-12" key="top"
                            v-show="focusedChurch == null"
                            ranking="top10"
							TV
                            @selectChurch="(church) => selectedChurch = church" />
                    </transition-group>
                </div>
            </div>
        </div>
	</section>
</template>
<script>
import { mapState, mapActions, mapGetters } from 'vuex'
import { crono } from 'vue-crono'
import Globe from '@/components/WWR/Globe'
import ChurchDetails from '@/components/WWR/ChurchDetails'
import Leaderboard from '@/components/WWR/Leaderboard'
import Title from '@/components/WWR/Title'
export default {
	components: {
        Globe,
		ChurchDetails,
		Leaderboard,
		Title
	},
	props: ['options'],
	computed: {
		...mapGetters('competitions', ['competition', 'doneDistance', 'rankedChurches', 'top10', 'statsByChurchId']),
		globeOptions() {
			return {
				autoSpin: this.options.autoSpin,
				selectedContinent: this.competition.selectedContinent,
				selectedChurch: this.options.selectedChurch,
				selectedMarker: this.competition.selectedMarker,
				x: this.options.x || 0,
				y: this.options.y || 0,
				zoom: this.options.zoom
			}
		},
		focusedChurch() {
			return this.options.selectedChurch && this.statsByChurchId(this.options.selectedChurch.id) || this.selectedChurch;
		}
	},
	data: function(){
		return {
			width: 1920,
			height: 1080,
			selectedChurch: null,
			selectTop10: true,
		}
	},
	async mounted(){
		await this.bindDistancesPerChurchRef();
		await this.bindChurchesRef();
		this.initializeCron();
	},
	mixins: [crono],
	methods: {
		...mapActions('competitions', ['bindDistancesPerChurchRef', 'bindChurchesRef']),
		autoSwitchChurch() {
			if (this.selectedChurch != null) {
				this.selectedChurch = null;
				return;
			}
			var selectRandomChurch = (list) => {
				var randomIndex = Math.floor(Math.random()*list.length)
				return this.statsByChurchId(list[randomIndex].id)
			}
			this.selectedChurch = this.selectTop10 ? selectRandomChurch(this.top10) : selectRandomChurch(this.rankedChurches)
			this.selectTop10 = !this.selectTop10;
		},
		initializeCron(){
			if (this.options.autoSpin) this.$cron.start("autoSwitchChurch")
			else this.$cron.stop("autoSwitchChurch")
		}
	},
	watch: {
		options: {
            deep: true,
            handler() {
                this.initializeCron()
            }
		}
	},
	cron: {
        time: 5000,
        method: "autoSwitchChurch",
        autoStart: false
    }
}
</script>
<style scoped>
canvas {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.8s ease;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>

<style>
.blue-gradient {
  background: radial-gradient(23.35% 44.52% at 72.47% 50%, rgba(0, 6, 29, 0.8) 65.45%, rgba(22, 30, 61, 0.8) 89.26%);
  background-repeat: no-repeat;
}
.gold-gradient {
  background: linear-gradient(90deg, #A9761F 0%, #D8C172 0.01%, #BB933F 0.02%, #A9761F 0.03%, #D8C172 100%);
  background-repeat: no-repeat;
}
.white-fade {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0) 100%);
  background-repeat: no-repeat;
}
</style>
