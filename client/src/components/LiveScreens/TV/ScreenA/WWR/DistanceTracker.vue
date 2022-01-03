<template>
    <div class="bg-primary rounded-xl w-full p-4">
        <div class="mx-4 bg-white-15 px-4 py-1 flex items-center justify-between">
            <p class="text-3xl leading-none uppercase">TOTAL DISTANCE: {{ Number(total).toLocaleString('nb-NO') }} km</p>
            <p class="text-3xl leading-none uppercase">Remaining Distance: {{ Math.max(Number(total - doneDistance), 0).toLocaleString('nb-NO') }} km</p>
        </div>
        <div class="DT mx-24 block mt-16 relative text-left">
            <table class="bg-white-fade w-full relative font-medium text-3xl">
                <thead class="bg-white-30">
                    <tr class="border-2 border-white gold-gradient" :style="{'background-size': `${percent}%`}">
                        <th v-for="(c, i) in formattedCheckpoints" :key="i" class="h-12" :style="{width: `${c.percentToNext}%`}"></th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td v-for="(c, i) in formattedCheckpoints" :key="i" :class="c.percentDone <= percent ? 'text-white' : 'text-white-30'">{{ c.name }}</td>
                    </tr>
                </tbody>
                <svg class="absolute top-0" :style="{
                'margin-top': '-42px',
                'margin-left': '-2px',
                height: '5.5rem',
                left: `${percent}%`
                }" viewBox="0 0 28 88" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 0L0 88H5.04489L5.04489 26.3288L28 14L0 0Z" fill="#C94B3A"/>
                </svg>
                <div class="absolute top-0 px-10" :style="{
                'margin-left': '-2px',
                height: '5.5rem',
                left: `${percent - (percent > 75 ? 18 : 0)}%`
                }">
                    <p class="text-3xl font-bold italic -mt-12 whitespace-no-wrap" >{{ doneDistance }} KM</p>
                </div>
            </table>
        </div>
    </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
export default {
    props: {
        cities: {
            type: Array,
            default: () => [
                ['', 0, 3],
                ['Lilienhof', 3, 19],
                ['Alwaye', 22, 17],
                ['Vanderbijlpark', 39, 20],
                ['Novo Sarandi', 59, 18],
                ['Leon', 77, 23]
            ]
        },
    },
    data: function() {
        return {
            visibleDistance: 0,
            visibleDoneDistance: 0,
        }
    },
    methods: {
        ...mapActions('competitions', ['bindDistanceShardsRef', 'bindChurchesRef', 'bindCheckpointsRef']),
        km(n) {
            let num = Number(n).toLocaleString()
            while (num.length < 5 || (n > 999 && num.length < 6)) num = '0'+num
            return num.replace(/^00/, '00 ')
        }
    },
    mounted: async function() {
        await this.bindChurchesRef();
        await this.bindCheckpointsRef();
        await this.bindDistanceShardsRef();
    },
    computed: {
        ...mapGetters('competitions', ['checkpoints', 'doneDistance']),
        total() {
            if (this.checkpoints == null || this.checkpoints.length == 0)
                return 0;
            return this.checkpoints.reduce((acc, c) => acc + c.nextDistance, 0)
        },
        visibleGoals() {
            let lastPassedGoal = 0
            let subDistance = 0
            let nextDistance = 0

            let max = this.checkpoints.length - 5

            for (let i in this.checkpoints) {
                let c = this.checkpoints[i]
                if (subDistance + c.nextDistance >= this.doneDistance || lastPassedGoal >= max) {
                    break;
                }

                lastPassedGoal++
                subDistance += c.nextDistance
                nextDistance = c.nextDistance
            }

            let visibleGoals = this.checkpoints.slice(lastPassedGoal, lastPassedGoal + 5)
            this.visibleDistance = visibleGoals.reduce((acc, x) => acc + x.nextDistance, 0)
            this.visibleDoneDistance = this.doneDistance - subDistance

            return visibleGoals
        },
        formattedCheckpoints() {
            var temp = 0
            var result = []

            this.visibleGoals.forEach((el, index) => {
                var clone = Object.assign({}, el)
                clone.percentDone = temp / this.visibleDistance* 100
                clone.percentToNext = (clone.nextDistance - temp) / this.visibleDistance* 100
                temp = clone.nextDistance
                result.push(clone)
            })
            return result;
        },

        percent() {
            return Math.min(this.visibleDoneDistance/ this.visibleDistance, 1) * 100
        }
    }
}
</script>

<style>
.DT table {
  border-left: 4px solid white;
  border-right: 4px solid white;
}
.DT table th {
  border: 2px solid white;
}
.DT table thead tr {
  border: 4px solid white;
}
.DT table tbody td {
  border-left: 2px solid white;
  border-right: 2px solid white;
}
.DT table td {
  padding: 1rem .25rem 0;
  line-height: 1;
}
</style>
