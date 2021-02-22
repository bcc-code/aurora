<template>
    <div class="relative overflow-hidden">
        <img class="shadow-lg object-cover object-center rounded" :src="imageUrl"/>
    </div>
</template>
<script>
export default {
    props: {
        imageUrl: {
            type: String,
            required: true
        }
    },
}
</script>