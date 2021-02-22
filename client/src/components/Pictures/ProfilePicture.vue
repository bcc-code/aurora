<template>
    <div class="profile-picture">
        <transition name="fade">
            <div class="bg-cover bg-center w-full h-full bg-background-1" 
                v-show="visible"
                :style="{ backgroundImage: `url(${picture.profilePictureThumb})` }">
            </div>
        </transition>
    </div>
</template>
<script>
export default {
    props: {
        picture: {
            type: Object,
            default: null
        }
    },
    computed: {
        visible() {
            return this.picture && (this.picture.visible == null || this.picture.visible)
        }
    }
}
</script>
<style scoped>
.profile-picture {
	height: 50px;
	border-radius: 999px;
    overflow: hidden;
    border: 2px solid var(--background-2);
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 2s;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>