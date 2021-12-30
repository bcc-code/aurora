<template>
    <table class="text-xl md:text-2xl font-serif uppercase w-full WWR">
        <thead>
            <tr>
                <th colspan="6">
                    <p class="italic font-bold text-3xl text-center" :class="TV ? 'md:text-6xl' : 'md:text-4xl'">
                        <template v-if="ranking != null">TOP 50</template>
                        <template v-else>LEADERBOARD</template>
                    </p>
                </th>
            </tr>
            <tr v-if="ranking == null">
                <th v-for="r in rankings" :key="r" colspan="3" 
                    @click="selectedRanking = r" 
                    :class="selectedRanking == r ? 'bg-gold' : 'cursor-pointer'">
                    <p class="italic font-bold text-2xl text-center" :class="TV ? 'md:text-4xl' : 'md:text-3xl'">{{r.toUpperCase()}}</p>
                </th>
            </tr>
        </thead>
        <transition-group name="flip-list" tag="tbody" v-if="leaderboard">
            <tr class="leading-normal" :class="TV ? 'md:text-4xl' : 'md:text-2xl'" v-for="(church, index) in leaderboard.map((el) => statsByChurchId(el.id))" :key="church.id" @click.stop="$emit('select-church', statsByChurchId(church.id))">
                <td class="md:pl-4 font-italic" colspan="1">
                    #{{index + 1 + page*10}}
                </td>
                <td colspan="1" >
                    <CountryFlag v-if="church.country != null" rounded :country="getCode(church.country)" class="-my-2 mt-1" />
                </td>
                <td class="italic" colspan="3">
                    <span class="font-bold" >{{church.name}}, </span><span>{{church.country}}</span>
                </td>
                <td class="italic font-bold" colspan="1">{{(ranking || selectedRanking) == 'total' ? church.distance : church.average}} KM</td>
            </tr>
        </transition-group>
    </table>
</template>
<script>
import { mapGetters, mapActions } from 'vuex'
import CountryFlag from 'vue-country-flag'
import { overwrite, getCode } from 'country-list'

export default {
    components: {
		CountryFlag
    },
    data: function() {
        return {
            rankings: [ 'total', 'average'],
            selectedRanking: 'total',
            page: 0,
        }
    },
    async mounted () {
        this.page = 0;
        console.log("test")
        setInterval(() => {
        console.log("test2")
            if(this.page == this.top50.length-1) {
                this.page = 0
            } else {
                this.page++
            }
        }, 8000)
        await this.bindDistancesPerChurchRef();
		await this.bindChurchesRef();
    },
    props: {
        ranking: { type: String, required: false },
        TV: { type: Boolean, default: false }
    },
    computed: {
        ...mapGetters('competitions', ['top10', 'top50', 'rankedChurches', 'rankedChurchesTotalDistance', 'statsByChurchId']),
        leaderboard() {
			switch(this.ranking || this.selectedRanking) {
                case 'total':
                    return this.rankedChurchesTotalDistance
                case 'average':
                    return this.rankedChurches
                case 'top10':
                    return this.top10
                case 'top50':
                    return this.top50[this.page % this.top50.length]
                default:
                    return this.rankedChurches
            }
        },
    },
    methods: {
        ...mapActions('competitions', ['bindDistancesPerChurchRef', 'bindChurchesRef']),
        getCode(name) {
            overwrite([{
                code: 'GB',
                name: 'United Kingdom'
			},
			{
				code: 'RU',
				name: 'Russia'
			},
			{
				code: 'US',
				name: 'USA'
            },
            {
                code: 'MD',
                name: 'Moldova'
            }])
			return getCode(name) == null ? '' : getCode(name);
		}
    }
}
</script>
<style scoped>
.bg-gold {
    background: #F3D279
}

table.WWR tr:nth-child(odd) {
  @apply bg-white-15;
}

.flip-list-enter-active{
  transition: opacity 1s ease;
}
.flip-list-leave-active {
  transition: none;
}
.flip-list-enter{
  opacity: 0;
}

.flip-list-leave-to {
  opacity: 0;
}

.flip-list-move {
  transition: transform 1s;
}
</style>