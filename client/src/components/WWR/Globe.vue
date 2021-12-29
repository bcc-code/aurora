<template>
    <section>
        <canvas class="world-canvas" id="worldCanvas" :width="`${width}px`" :height="`${height}px`"></canvas>
		<canvas id="pointsCanvas" :width="`${width}px`" :height="`${height}px`"></canvas>
    </section>
</template>
<script>
import * as d3 from "d3";
import * as d3geo from 'd3-geo-projection'
import world from '@/mixins/world'
import { mapState, mapActions, mapGetters } from 'vuex'
import { Continents } from '@/data/world/continents.js'
import { crono } from 'vue-crono'
import EventBus from '@/utils/eventBus.js'
export default {
	props: {
		width: { type: Number | String },
		height: { type: Number | String },
		options: { type: Object },
		position: { type: Array, default: () => [0.75, 0.5] },
		selectedChurch: { type: Object },
		zoom: { type: Number, default: 20 },
		allowSelection: { type: Boolean, default: false },
		allowWheelZoom: { type: Boolean, default: false },
		capture: { type: Boolean, default: false }
	},
	computed: {
		...mapGetters('competitions', ['doneDistance']),
		...mapState('competitions', ['churches']),
		ctx(){
			return document.getElementById("pointsCanvas").getContext("2d");
		},
		pathGenerator(){
			return d3.geoPath(this.projection, this.ctx);
		},
		projection(){
			return d3.geoOrthographic().scale(this.allowWheelZoom ? this.wheelScale : Math.pow(this.zoom, 2)).rotate([this.x, this.y, 0]).translate([this.width * this.position[0], this.height * this.position[1]]);;
		},
		markerCanvas() {
			return document.getElementById("pointsCanvas");
		},
		steps() {
			let x = this.churches.filter((el) => el.step).sort((a, b) => a.stepNumber - b.stepNumber);
            return x
		}
	},
	data: function(){
		return {
			loaded: false,
			drag: false,
			dragndrop: false,
			x: -30,
			y: -20,
			clientX: null,
			clientY: null,
			hoveredMarker: null,
			wheelScale: 400
		}
	},
	async mounted(){
		window.onerror = (message, url, lineNumber) => {
			this.$toasted.error(message);
		};
		this.fetchWorld();
		this.initializeMap();
		this.bindDistanceShardsRef();
		this.bindChurchesRef();
        this.bindCheckpointsRef();
	},
	mixins: [world, crono],
	methods: {
		...mapActions('competitions', ['bindDistanceShardsRef', 'bindChurchesRef', 'bindCheckpointsRef']),
		render() {
			this.resetWorld();
			this.resetElements();
			this.drawBorders();
			this.drawRunningWorld();
			if (this.options.selectedContinent != null && this.options.selectedContinent != '')
				this.highlightContinent(Continents[this.options.selectedContinent])
			this.drawRoad();
			this.drawRoadProgress();
			this.drawMarkers();
		},
		autoSpin() {
			this.x += 0.1;
			this.render();
		},
		initializeMap(){
			const { x, y, zoom } = this.options;
			this.x = x || this.x
			this.y = y || this.y
			this.wheelScale = zoom || this.wheelScale
			if (this.options.autoSpin) {
				this.$cron.start("autoSpin");
			}
			else {
				this.$cron.stop("autoSpin");
				this.initHandsGestures();
			}
			this.render();
			this.loaded = true;
		},
		initHandsGestures(){
			d3.select(this.markerCanvas).on('touchstart touchmove touchend', (event) => {
				d3.event.preventDefault()
			});
			d3.select(this.markerCanvas).on('pointerdown', () => {
				this.drag = true;
				this.clientX = d3.event.clientX;
				this.clientY = d3.event.clientY;
			});
			d3.select(this.markerCanvas).on('pointerleave', () => {
				this.drag = false;
				this.dragndrop = false;
			});
			d3.select(this.markerCanvas).on('pointermove', () => {
				if (!this.drag) {
					if (this.allowSelection) {
						const marker = this.findMarker();
						this.hoveredMarker = marker ? marker : null;
					}
					this.render()
					return;
				}
				this.dragndrop = true
				this.x += (100 / this.projection.scale()) * (d3.event.clientX - this.clientX) * 0.5
				this.y -= (100 / this.projection.scale()) * (d3.event.clientY - this.clientY) * 0.5
				this.clientX = d3.event.clientX
				this.clientY = d3.event.clientY
				if (this.capture) EventBus.$emit('WWR_GLOBE_MOVE', { x: this.x, y: this.y })
				this.render()
			});
			d3.select(this.markerCanvas).on('pointerup', () => {
				this.drag = false;
				if (!this.dragndrop && this.allowSelection) {
					const marker = this.findMarker();
					if (marker) {
						this.$emit('select-church', marker);
						this.render();
						return;
					}
				}
				this.dragndrop = false
			});
			if (this.allowWheelZoom) {
				d3.select(this.markerCanvas).on("wheel.zoom", () => {
					var currScale = this.projection.scale();
					var newScale = currScale - 0.001 * currScale * event.deltaY;
					if (newScale < 100) return;
					this.wheelScale = newScale;
					if (this.capture) EventBus.$emit('WWR_GLOBE_ZOOM', newScale)
					this.render()
				});
			}
		},
		resetElements(){
			this.ctx.clearRect(0, 0, this.width, this.height);
		},
		drawRoad() {
			for (var i=0; i < this.steps.length; i++) {
				this.ctx.beginPath();
				this.ctx.strokeStyle = '#fff';
				this.ctx.lineWidth = '2'
				var coords1 = this.coordsToArray(this.steps[i].coordinates);
				var coords2 = this.coordsToArray(this.steps[(i+1)%this.steps.length].coordinates)
				var interpolate = d3.geoInterpolate(coords1, coords2)
				var total = this.steps[i].nextDistance / 15
				var lines = []
				var push = true
				for (var t=1; t<=total; t++) {
					coords2 = interpolate(t/total)
                    if (push) {
                        lines.push([coords1, coords2])
                    }
					push = !push;
					coords1 = coords2
				}
				this.pathGenerator({
					type: 'Feature',
					geometry: {
						type: 'MultiLineString',
						coordinates: lines
					}
				});
				this.ctx.stroke();
			}
		},
		drawRoadProgress() {
			var over = false
            let soFar = 0
			for (var i=0; i < this.steps.length && !over; i++) {
				this.ctx.beginPath();
				var coords1 = this.coordsToArray(this.steps[i].coordinates);
				var coords2 = this.coordsToArray(this.steps[(i+1)%this.steps.length].coordinates)
                    soFar += this.steps[i].nextDistance
				if (this.doneDistance < soFar) {
					over = true;
					var offset = this.steps[i].nextDistance
					var prog = soFar - this.doneDistance;
					var coords2 = d3.geoInterpolate(coords1, coords2)(prog/offset)
				}
				this.pathGenerator({
					type: 'Feature',
					geometry: {
						type: 'LineString',
						coordinates: [coords1, coords2]
					}
				});
				this.ctx.strokeStyle = '#fff';
				this.ctx.lineWidth = '4'
				this.ctx.setLineDash([])
				this.ctx.stroke();
			}
		},
		drawMarkers() {
			this.churches.forEach((marker) => {
				if (!marker.coordinates) {
					return
				}
				var color = (marker == this.hoveredMarker) ? "#a51414" : (marker.step) ? "#C54C32" : "#FDF3E2";
				var showName = (marker == this.hoveredMarker || (this.selectedChurch != null && marker.name.toLowerCase() == this.selectedChurch.name.toLowerCase())) ? true : marker.step == true;
				var size = marker.step ? marker.name.toLowerCase() == this.options.selectedMarker ? 3 : 1.5 : 0.8;
				var fontSize = marker.name.toLowerCase() == this.options.selectedMarker ? 40 : (marker.step == true) ? 20 : 12;
				this.drawMarker(this.coordsToArray(marker.coordinates), size, color, marker.name, showName, fontSize, marker.leftSide == true)
			});
		},
		drawMarker(coords, size, color, name, showName = true, fontSize = 0, leftSide = false){
			var factor = this.projection.scale()/600;
			factor *= Math.max(0.2, Math.pow(0.8, factor));
			size *= factor;
			fontSize *= factor;
			color = (this.selectedChurch != null && name == this.selectedChurch.name)
				? '#003366'
				: color;
			const center = [this.width * this.position[0], this.height * this.position[1]];
			var coordinates = this.projection(coords)
			var gdistance = d3.geoDistance(coords, this.projection.invert(center));
			if (gdistance <= 1.57) {
				this.ctx.beginPath();
				this.ctx.fillStyle = color;
				this.ctx.moveTo(coordinates[0] - 1 * size, coordinates[1] + 1 * size);
				this.ctx.lineTo(coordinates[0] - 1 * size, coordinates[1] - 19 * size);
				this.ctx.lineTo(coordinates[0] + 9 * size, coordinates[1] - 14 * size);
				this.ctx.lineTo(coordinates[0] + 1 * size, coordinates[1] - 9 * size);
				this.ctx.lineTo(coordinates[0] + 1 * size, coordinates[1] + 1 * size);
				this.ctx.lineTo(coordinates[0] - 1 * size, coordinates[1] + 1 * size);
				this.ctx.fill();

				if (showName) {
					this.ctx.font = `italic small-caps bold ${fontSize}px Barlow, sans-serif`;
					this.ctx.textAlign = "start"
					var measure = this.ctx.measureText(name);
					var offsetX = 15 * factor;
					var offsetY = 7 * factor;
					var origin = coordinates[0] + (leftSide ? - offsetX - measure.width : offsetX);
					this.ctx.fillStyle = '#aaaaaa50';
					this.ctx.fillRect(origin, coordinates[1] - fontSize, measure.width, fontSize);
					this.ctx.fillStyle = "white"
					this.ctx.fillText(name, origin, coordinates[1] - offsetY);
					this.ctx.beginPath();
					this.ctx.strokeStyle = '#fff';
					this.ctx.setLineDash([]);
					this.ctx.lineWidth = 0.5;
					this.ctx.moveTo(coordinates[0], coordinates[1]);
					this.ctx.lineTo(coordinates[0] + (leftSide ? - offsetX - measure.width : offsetX + measure.width), coordinates[1]);
					this.ctx.stroke();
				}
			}
		},
		findMarker(event) {
			const x = d3.event.layerX;
			const y = d3.event.layerY;
			const coordinates = this.projection.invert([x, y]);
			for (var i=0; i < this.churches.length; i++) {
				const THRESHOLD = 0.3;
				var marker = this.churches[i];
				if (Math.abs(coordinates[0] - marker.coordinates.d_) < THRESHOLD
					&& Math.abs(coordinates[1] - marker.coordinates.f_) < THRESHOLD){
						return marker;
				}
			}
			return null
		},
		coordsToArray(coordinates) {
            let x = [coordinates._long, coordinates._lat]
            return x
		},
	},
	watch: {
		options(){
			this.initializeMap();
		},
		doneDistance(){
			if (this.loaded) this.render();
		},
		zoom() {
			if (this.loaded) this.render();
		},
		selectedChurch() {
			if (this.loaded) this.render();
		},
		churches() {
			if (this.loaded) this.render();
		}
	},
	cron: {
        time: 20,
        method: "autoSpin",
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
</style>
