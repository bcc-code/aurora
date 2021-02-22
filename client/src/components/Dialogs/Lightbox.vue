<template>
    <div class="h-screen w-full fixed top-0 left-0 z-50 bg-black bg-opacity-75 flex items-center justify-center" @click.self.stop="$emit('close')">
        <section class="container">
            <img :src="src" width="100%" />
        </section>
    </div>
</template>
<script>
export default {
    props: ['src']
}
</script>