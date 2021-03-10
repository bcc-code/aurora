<template>
	<div class="invisible">
		{{ entry }}
	</div>
</template>

<script>
export default {
	props: {
		entry: {
			type: Object
		}
	}
}
</script>
<style scoped>
	div.invisible {
		display: none;
	}
</style>
