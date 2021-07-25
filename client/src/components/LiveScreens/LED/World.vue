<template>
	<section ref="container" class="world-container bg-contain bg-center bg-no-repeat" :style="{ backgroundImage: `url(${backgroundImageUrl})` }">
		<transition name="fade-slide">
			<CheckinsCount class="world-map" v-if="options.showCheckinsNumber" :event="event" />
		</transition>
		<canvas id="worldCanvas" :width="`${width}px`" :height="`${height}px`" class="world-canvas"></canvas>
		<canvas id="pointsCanvas" :width="`${width}px`" :height="`${height}px`"></canvas>
		<canvas id="animationCanvas" :width="`${width}px`" :height="`${height}px`"></canvas>
	</section>
</template>
<script>
import * as d3 from "d3";
import * as d3geo from 'd3-geo-projection'
import world from '@/mixins/world'
import { mapGetters, mapActions } from 'vuex'
import CheckinsCount from '@/components/LiveScreens/shared/CheckinsCount.vue'
import { crono } from 'vue-crono'
export default {
	components: {
		CheckinsCount
	},
	props: ['options', 'size', 'event'],
	computed: {
		...mapGetters('checkins', ['getScreenCheckins']),
		ctx(){
			return document.getElementById("pointsCanvas").getContext("2d");
		},
		pathGenerator(){
			return d3.geoPath(this.projection, this.ctx);
		},
		animCtx(){
			return document.getElementById("animationCanvas").getContext("2d");
		},
		animPathGenerator(){
			return d3.geoPath(this.projection, this.animCtx);
		},
		width() {
			return this.size.height * 16/9;
		},
		height() {
			return this.size.height;
		},
		leftOffset() {
			return (this.size.width - this.width)/2;
		},
		projection(){
			return d3geo.geoTimes().scale(this.width / (1.518 * Math.PI)).center([11.8,26]).translate([this.width/2, this.height/2]);
		},
		backgroundImageUrl() {
			if (this.options.mapUrl != null && this.options.mapUrl.length > 0)
				return this.options.mapUrl
			return '/images/world.svg';
		},
		markersColor(){
			return (this.options.markersColor != null && this.options.markersColor.length > 0) ? this.options.markersColor : '#ffffff'
		}
	},
	data: function(){
		return {
			MAX_SIZE: 10,
			SPEED: 0.01,
			SIZE: 1.5,
			THRESHOLD: 0.05,
			world: {},
			initialElements: [],
			newElements: [],
			animations: [],
			timer: d3.timer(() => {}),
			loaded: false,
			markersRate: 3000,
            cachedElements: [],
		}
	},
	async created(){
		await this.fetchWorld();
		await this.initializeMap();
	},
	mixins: [world, crono],
	methods: {
		async initializeMap(){
			this.resetWorld();
			this.resetElements();
			this.resetAnimations();
			this.drawWorld();
			this.initialElements = (await this.getScreenCheckins(this.event)).filter((el) => el.coords.f_ != 0 && el.coords.d_ != 0);
			this.drawInitialElements();
			this.timer = d3.timer(this.drawAnimations);
			this.timer.stop();
			this.loaded = true;
		},
		async updateCheckins() {
			if (this.loaded) {
				var newCheckins = await this.getScreenCheckins(this.event, new Date().getTime() - this.markersRate * 1.5);
				newCheckins.forEach((checkin) => {
					if (checkin.coords.f_ != 0 && checkin.coords.d_ != 0) {
						var exists = this.cachedElements.some((el) => el.personId == checkin.personId);
						if (!exists) {
							/* Find a point nearby and use it to draw the animation */
							var pointNearby = this.cachedElements.find((el) => this.pointsAreNear(el, checkin));
							var newAnimation;
							if (pointNearby != null)
								newAnimation = { id: pointNearby.personId, coords: pointNearby.coords, radius: 0.05 }
							else {
								newAnimation = { id: checkin.personId, coords: checkin.coords, radius: 0.05 }
								this.newElements.push(checkin);
							}
							if (this.animations.length <= 20){
								this.animations.push(newAnimation)
							}
						}
					}
				});
				this.drawNewElements();
				if (this.animations.length > 0)
					this.timer.restart(this.drawAnimations);
			}
		},
		resetElements(){
			this.ctx.clearRect(0, 0, this.width, this.height);
		},
		drawInitialElements(){
			this.filterPoints(this.initialElements).forEach((geolocation) => { this.drawPoint(geolocation) });
		},
		drawNewElements(){
			this.newElements.forEach((geolocation) => { this.drawPoint(geolocation) });
			this.newElements = [];
		},
		drawPoint(point){
			this.ctx.beginPath();
			const coordinates = this.projection([point.coords._long, point.coords._lat]);
			this.ctx.arc(coordinates[0], coordinates[1], this.SIZE, 0, 2 * Math.PI, false);
			this.ctx.shadowColor= this.markersColor
			this.ctx.shadowBlur= 5;
			this.ctx.fillStyle = this.markersColor
			this.ctx.fill();
		},
		resetAnimations(){
			this.animCtx.clearRect(0, 0, this.width, this.height);
		},
		drawAnimations(){
			this.animCtx.clearRect(0, 0, this.width, this.height)

			this.animations.forEach((animation, index) => {
				this.animCtx.beginPath();
				var coordinates = this.projection([animation.coords.d_, animation.coords.f_]);
				this.animCtx.arc(coordinates[0], coordinates[1], this.MAX_SIZE * animation.radius, 0, 2 * Math.PI, false);
				animation.radius += this.SPEED;
				if (animation.radius > 1)
					this.animations.splice(index, 1);
				else {
					var opacity = `${Math.round((1 - animation.radius)*100)}`
					if (opacity.length == 1)
						opacity = `0${opacity}`;
					this.animCtx.fillStyle = `${this.markersColor}${opacity}`;
					this.animCtx.fill();
				}
			});
			if (this.animations.length == 0){
				this.timer.stop();
			}
		},
		pointsAreNear(a,b){
			return Math.abs(a.coords.f_ - b.coords.f_) < this.THRESHOLD
			&& Math.abs(a.coords.d_ - b.coords.d_) < this.THRESHOLD;
		},
		filterPoints(list){
			var result = []
			list.forEach((point) => {
				if (point.coords._lat != 0 || point.coords._long != 0){
					result.push(point);
                }
			})
			return result
		},
	},
	watch: {
		options: {
			deep: true,
			async handler() {
				await this.initializeMap();
			}
		},
		leftOffset(val) {
			this.$refs.container.$el.style.setProperty('--leftOffset', `${val}px`);
		}
	},
	cron: {
		time: 3000,
		method: 'updateCheckins'
	}
}
</script>
<style scoped>
:root {
	--leftOffset: '0px'
}

.world-container {
	position: absolute;
	top:0;
	left:0;
	height: 100%;
	width: 100%;
}
.world-container .world-canvas {
	display: none;
}

canvas {
	position: absolute;
	top: 0;
	left: var(--leftOffset);
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 1s, transform 1s;
  position: absolute;
  left:0;
  bottom:0;
}
.fade-slide-enter, .fade-slide-leave-to {
  opacity: 0;
  transform: translateY(20%);
}
</style>
