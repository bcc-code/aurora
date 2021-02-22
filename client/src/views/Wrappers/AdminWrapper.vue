<template>
	<section class="bg-background-1 text-label-1 min-h-screen antialiased text-lg">
		<Header />
		<div class="main p-5 relative">
			<router-view v-if="isAuthenticated && isMounted" />
			<Spinner center v-else />
		</div>
	</section>
</template>
<script>
import { mapActions, mapGetters, mapState } from 'vuex'
import Header from '@/components/Layout/Header.vue'
import keys from '@/utils/keys'
export default {
	components: {
		Header
	},
	data: function(){
		return {
			isMounted: false
		}
	},
	computed: {
		...mapState('session', ['isAuthenticated'])
	},
	async mounted(){
        await this.bindTemplates();
        await this.bindConfigRef();
        await this.bindCompetitionsRef();
        this.isMounted = true;
	},
	methods: {
		...mapActions('templates', ['bindTemplates']),
		...mapActions('configs', ['bindConfigRef']),
		...mapActions('competitions', ['bindCompetitionsRef']),
	},
	watch: {
		'$route.name': {
			immediate: true,
			handler(value) {
				var pageName = this.$t(`menu.${value}`)
				document.title = `${pageName} | Admin | ${keys.APP.NAME}`;
			}
		}
	}
}
</script>