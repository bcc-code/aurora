<template>
    <section class="w-full mt-8" v-if="$can('update', profilePictures)">
        <Spinner center v-if="profilePictures.length <= 0" />
        <template v-else>
            <PicturesGrid :title="$t('profile-pictures.thisWeek')" :pictures="weekProfilePictures" @toggle="toggleRejectList" />
            <PicturesGrid :title="$t('profile-pictures.thisMonth')" :pictures="monthProfilePictures" @toggle="toggleRejectList" />
            <PicturesGrid :title="$t('profile-pictures.older')" :pictures="oldProfilePicturesLimit" @toggle="toggleRejectList" />
            <div class="text-center mt-5">
                <button v-if="oldProfilePicturesLimit.length < oldProfilePictures.length" class="btn btn-blue" @click.stop="limit += 500">{{$t('actions.show-more')}}</button>
            </div>
            <button class="fixed h-10 btn btn-red" :class="[rejectList.length == 0 ? 'opacity-50 cursor-default': '']" style="top: 50px; right: 50px" @click.stop="reject">{{$t('contributions.reject')}}</button>
        </template>
    </section>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import PicturesGrid from '@/components/ProfilePictures/Grid'
export default {
    components: {
        PicturesGrid
    },
    data: function() {
        return {
            rejectList: [],
            limit: 500
        }
    },
    computed: {
        ...mapState('users', ['profilePictures']),
        sortedProfilePictures() {
            return this.profilePictures.sort((a,b) => {
                if (a.updatedAt != null) return b.updatedAt ? b.updatedAt - a.updatedAt : -1
                else return b.updatedAt ? 1 : 0
            })
        },
        weekProfilePictures() {
            return this.sortedProfilePictures.slice(0, this.sortedProfilePictures.findIndex((el) => el.updatedAt < new Date().getTime() - (7 * 24 * 60 * 60 * 1000)))
        },
        monthProfilePictures() {
            return this.sortedProfilePictures.slice(this.weekProfilePictures.length, this.sortedProfilePictures.findIndex((el) => el.updatedAt < new Date().getTime() - (30 * 24 * 60 * 60 * 1000)) - this.weekProfilePictures.length)
        },
        oldProfilePictures() {
            return this.sortedProfilePictures.slice(this.weekProfilePictures.length + this.monthProfilePictures.length);
        },
        oldProfilePicturesLimit() {
            return this.oldProfilePictures.slice(0, this.limit);
        }
    },
    created: async function(){
        await this.bindUsersRef();
    },
    methods: {
        ...mapActions('users', ['bindUsersRef', 'rejectProfilePicturesRef']),
        toggleRejectList(user){
            var index = this.rejectList.indexOf(user);
            if (index > -1)
                this.rejectList.splice(index, 1) 
            else
                this.rejectList.push(user)
        },
        async reject(){
            if (this.rejectList.length > 0)
                await this.rejectProfilePicturesRef(this.rejectList)
                    .then(async () => {
                        this.showSuccess('messages.pictures-removed');
                        await this.bindUsersRef()
                    })
                    .catch(this.showError);
        },
        showMore() {
            
        }
    }
}
</script>