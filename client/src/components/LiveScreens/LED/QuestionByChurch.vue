<template>
    <transition name="zoom">
        <div class="w place-items-center" v-if="loaded">
            <table class="table-auto w-4/6 h-5/6">
                <thead>
                    <tr>
                        <th colspan="3">
                            <h1 class="text-5xl">RESULTATER TOPP 10</h1>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr :class="[rowColor(i)]" class="text-3xl" v-for="(r, i) in churchStats" :key="r.churchId">
                        <td class="rounded">#{{ 1+(i*1) }}</td>
                        <td class="text-left pl-20">BUK {{ churchMap[r.churchId] }}</td>
                        <td>{{ (r.percentage*100).toFixed(2) }}%</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </transition>
</template>

<script>
import Api from '@/utils/api.js'
import { mapGetters, mapActions } from 'vuex'
import { mapModels } from '@/mixins/mapModels'
import { crono } from 'vue-crono'
import { db } from '@/data/db.js'

export default {
    props: ['options', 'event'],
    data: function(){
        return {
            loaded: false,
            churchMap: {},
        }
    },
    mixins: [crono],
    computed: {
        ...mapGetters('questions', ['churchStats']),
        isHorizontal() {
            return this.options.viewType == 'bars-h'
        },
    },
    async mounted(){
        let bindChurchesStats = this.bindChurchStatsRef(this.event.id);
        let nameMap = this. loadChurchMap()

        await bindChurchesStats
        await nameMap

        console.dir(this.churchMap)
        this.loaded = true
    },
    methods: {
        ...mapActions('questions', ['bindChurchStatsRef']),

        async updateStats() {
            await Api.updateChurchBasedPollResults(this.event.id);
        },

        async loadChurchMap() {
            let churches = await db.collection("churches").get()
            churches.docs.forEach(x => {
                let d = x.data()
                this.churchMap[d.churchId] = d.name
            })
        },
        rowColor(pos) {
            if (pos == 0) {
                return "first"
            }

            if (pos == 1) {
                return "second"
            }

            if (pos == 2) {

                return "third"
            }

            return "rest"
        }
    },
    cron: {
        time: 5000,
        method: 'updateStats'
    },
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Exo:wght@700&display=swap');
.zoom-leave-active {
  transition: opacity 1s, transform 1s;
  position: absolute;
  left:0;
  right:0;
  top:0;
  bottom:0;
}
.first {
    background-color: #FF7B5C9A;
}
.second {
    background-color: #FF9C409A;
}
.third {
    background-color: #fbcba19a;
}
.rest{
    background-color: #0000009A;
}
.zoom-enter {
  opacity: 0;
  transform: scale(1.2);
}
.zoom-leave-to {
  opacity: 0;
  transform: scale(.8);
}
.wrapper {
  transition: 1s all ease;
}
.w {
    font-family: 'Exo', sans-serif;
}

th {
    color: #FF9C40;
}

td {
    border: 2px solid white;
}
</style>
