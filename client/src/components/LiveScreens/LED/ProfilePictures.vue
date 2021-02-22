<template>
	<section>
		<section class="tiles">
			<ProfilePicture v-for="picture in layer2" :key="`${picture.personId}${randomString()}`" :picture="picture"/>
		</section>
		<section class="tiles">
			<ProfilePicture v-for="picture in layer1" :key="`${picture.personId}${randomString()}`" :picture="picture" />
		</section>
		<section class="tiles">
			<ProfilePicture v-for="picture in layer0" :key="`${picture.personId}${randomString()}`" :picture="picture" />
		</section>
	</section>
</template>

<script>
import ProfilePicture from '@/components/Pictures/ProfilePicture.vue'
import Vue from 'vue'
import { crono } from 'vue-crono'
import { mapGetters, mapActions } from 'vuex'
export default {
	components: {
		ProfilePicture
	},
	props: ['options'],
	data: function(){
		return {
			layer0: [],
			layer1: [],
			layer2: [],
			activeLayerIndex: 0,
			pattern: this.shuffle([...Array(330).keys()]),
			progress: 0,
			SIZE: 330,
		}
	},
	created: async function(){
		await this.bindUsersRef();
		await this.bindCheckinsRef();
		this.layer0 = await this.loadRandomPictures(true);
		this.layer1 = await this.loadRandomPictures(false);
		this.layer2 = await this.loadRandomPictures(true);
		this.updateCronTime();
	},
	computed: {
		...mapGetters('users', ['getRandomPictures']),
		hiddenLayerIndex(){
			return (this.activeLayerIndex + 2) % 3;
		},
		TIME(){
			return this.options.frequency ? this.options.frequency : 1
		}
	},
	methods: {
		...mapActions('users', ['bindUsersRef']),
		...mapActions('checkins', ['bindCheckinsRef']),
		switchRandomPictures(){
			var indexes = [];
			for (var i=0; i<20; i++) {
				indexes.push(this.pattern[this.progress++]);
				if (this.progress == this.pattern.length)
					break;
			}	
			if (this.activeLayerIndex == 2 || this.activeLayerIndex == 0)
				indexes.forEach((index) => { if (this.layer0[index] != null) this.layer0[index].visible = !this.layer0[index].visible })
			if (this.activeLayerIndex == 1 || this.activeLayerIndex == 0)
				indexes.forEach((index) => { if (this.layer1[index] != null) this.layer1[index].visible = !this.layer1[index].visible })
		},
		async loadRandomPictures(visible = false) {
			return (await this.getRandomPictures(this.SIZE)).map(el => { el.visible = visible; return el})
		},
		shuffle(array) {
			var currentIndex = array.length, temporaryValue, randomIndex;
			while (0 !== currentIndex) {
				randomIndex = Math.floor(Math.random() * currentIndex);
				currentIndex -= 1;
				temporaryValue = array[currentIndex];
				array[currentIndex] = array[randomIndex];
				array[randomIndex] = temporaryValue;
			}
			return array;
		},
		updateCronTime(){
			this.$cron.time('switchRandomPictures', Math.max(this.TIME, 0.5) * 1000)
		},
		randomString(){
			return Math.random().toString(36).substring(7);
		},
	},
	mixins: [crono],
	cron: {
		time: 60000,
		method: 'switchRandomPictures'
	},
	watch: {
		async progress(newValue){
			if (newValue == this.pattern.length){
				this.activeLayerIndex = (this.activeLayerIndex + 1) % 3;
				this.progress = 0;
				if (this.hiddenLayerIndex == 0){
					this.layer0 = await this.loadRandomPictures(false);
				}
				else if (this.hiddenLayerIndex == 1){
					this.layer1 = await this.loadRandomPictures(false);
				}
				else {
					this.layer2 = await this.loadRandomPictures(true);
				}
			}
		},
		TIME(){
			this.updateCronTime();
		}
	}
}
</script>
<style scoped>
.tiles {
	position: absolute;
	top: 30px;
	left: 30px;
	right: 30px;
	bottom: 30px;
	display: grid;
	grid-gap: 10px;
	justify-content: center;
	grid-template-columns: repeat(auto-fit, 50px);
}

.tiles .profile-picture {
    border: 1px solid #eeeeee30;
}
</style>