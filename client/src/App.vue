<template>
	<div id="app">
		<router-view v-if="$route.name=='callback' || $route.name=='unauthorized'" />
		<ScreenWrapper v-else-if="$route.name=='livescreen'" />
		<NewAdminWrapper v-else />
	</div>
</template>
<script>
import NewAdminWrapper from '@/views/Wrappers/NewAdminWrapper'
import ScreenWrapper from '@/views/Wrappers/ScreenWrapper'

export default {
	components: {
		NewAdminWrapper,
		ScreenWrapper
	}
}
</script>