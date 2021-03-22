<template>
	<div id="app">
		<router-view v-if="$route.name=='callback' || $route.name=='unauthorized'" />
		<ScreenWrapper v-else-if="$route.name=='livescreen'" />
		<AdminWrapper v-else />
	</div>
</template>
<script>
import AdminWrapper from '@/views/Wrappers/AdminWrapper'
import ScreenWrapper from '@/views/Wrappers/ScreenWrapper'

export default {
	components: {
		AdminWrapper,
		ScreenWrapper
	}
}
</script>