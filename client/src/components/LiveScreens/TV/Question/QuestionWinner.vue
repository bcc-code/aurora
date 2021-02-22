<template>
    <transition name="fade">
        <section v-if="mounted" >
            <CorrectAnswer v-if="isDobbel && options.showCorrectAnswer" :question="question" class="shadow-lg px-8 py-6 relative bg-light-80 rounded-xl text-4xl text-black leading-tight text-left" />
            <div class="shadow-lg px-8 py-6 relative mt-5 bg-light-80 rounded-xl text-4xl text-black leading-tight text-left overflow-hidden">
                <div class="flex w-full items-center justify-between">
                    <div class="w-3/4 flex flex-col leading-none">
                        <p><span>Gratulerer:</span></p>
                        <div class="mt-3 w-full overflow-hidden h-20">
                            <div v-if="candidates && candidates.length > 0 && question.winner != null"
                            class="w-full flex flex-col flex-no-wrap whitespace-no-wrap"
                            :style="'animation: scroll 10s'">
                                <div class="mb-4 w-full"
                                :id="candidate.personId === question.winner.personId ? 'winner' : ''"
                                v-for="(candidate, index) in candidates"
                                :key="index">
                                    <p class="font-semibold text-4xl" >{{ displayName(candidate) }}</p>
                                    <p class="mt-2 opacity-75 text-3xl" >{{ churchAndCountry(candidate) }}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <CorrectAnswer v-if="!isDobbel && options.showCorrectAnswer" :question="question" class="w-1/4" />
                </div>
            </div>
        </section>
    </transition>
</template>

<script>
import user from '@/mixins/user'
import { mapGetters, mapActions} from 'vuex'
import CorrectAnswer from './CorrectAnswer'
export default {
    components: {
        CorrectAnswer
    },
    props: ["question", "options", "isDobbel"],
    mixins: [user],
    data() {
        return {
            candidates: [],
            mounted: false
        }
    },
    methods: {
        ...mapActions('questions', ['bindAnswersRef', 'updateQuestionRef']),
    },
	async mounted(){
		if (this.question != null){
            var responses = await this.responsesByQuestionId(this.question.id, 100);
            this.candidates = [];
            this.candidates.push(this.question.winner);
            for (var response of responses.slice(0,10)) {
                var user  = (await this.userByPersonId(response.personId).get()).data();
                this.candidates.push(user);
            }
            while(this.candidates.length < 100) {
                this.candidates = this.candidates.concat(...this.candidates)
            }
            this.candidates = this.candidates.slice(0, 100);
        }
        this.mounted = true;
	},
    computed: {
        ...mapGetters('questions', ['responsesByQuestionId']),
        ...mapGetters('users', ['userByPersonId'])
    }
};
</script>

<style>
@keyframes scroll {
    from { transform: translateY(-100%);}
    to { transform: translateY(0px);}
}
</style>