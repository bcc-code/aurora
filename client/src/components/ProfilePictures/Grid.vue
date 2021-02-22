<template>
    <section>
        <p class="mb-3 text-center text-lg">{{title}}</p>
        <section class="tiles">
            <div class="profile-picture"  v-for="picture in pictures" :key="`${picture.personId}`">
                <div class="bg-cover bg-center bg-background-1 w-full h-full cursor-pointer"
                    :class="{ 'rejected': $parent.rejectList.includes(picture) }"
                    :style="{ backgroundImage: `url(${picture.profilePictureThumb})` }"
                    @click.stop="$emit('toggle', picture)"></div>
            </div>
        </section>
    </section>
</template>
<script>
export default {
    props: ['title', 'pictures']
}
</script>
<style scoped>
.tiles {
    position: relative;
	display: grid;
	grid-gap: 10px;
	justify-content: center;
	grid-template-columns: repeat(auto-fit, 60px);
}

.profile-picture {
	height: 60px;
	border-radius: 999px;
    overflow: hidden;
    border: 2px solid var(--background-2);
    position: relative;
}

.rejected {
    box-shadow:inset 0 0 0 2000px rgba(255, 0, 0, 0.6);
}
</style>
