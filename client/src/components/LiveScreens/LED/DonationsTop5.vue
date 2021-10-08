<template>
<div>
   <div style="display: flex" v-if="dataLoaded">
    <div class="table-wrapper league-l" >
            <div class="league-title">
                League L
            </div>
            <div class="divider" />
           <table>
                <tr v-for="(value,index) in top5L" :key="value.churchId" v-if="value.amountPerDS > 0">
                    <td class="pos">{{ index + 1 }}.</td>
                    <td class="name">{{ churches[value.churchId].name }} </td>
                    <td class="amount">{{ value.amountPerDS }} kr/DS</td>
                </tr>
          </table>
    </div>
    <div class="table-wrapper league-m" >
        <div class="league-title">
            League M
        </div>
            <div class="divider" />
       <table>
            <tr v-for="(value,index) in top5M" :key="value.churchId" v-if="value.amountPerDS > 0">
                <td class="pos">{{ index + 1 }}.</td>
                <td class="name">{{ churches[value.churchId].name }} </td>
                <td class="amount">{{ value.amountPerDS }} kr/DS</td>
            </tr>
      </table>
    </div>
    <div class="table-wrapper league-s" >
        <div class="league-title">
            League S
        </div>
            <div class="divider" />
       <table>
            <tr v-for="(value,index) in top5S" :key="value.churchId" v-if="value.amountPerDS > 0">
                <td class="pos">{{ index + 1 }}.</td>
                <td class="name">{{ churches[value.churchId].name }} </td>
                <td class="amount">{{ value.amountPerDS }} kr/DS</td>
            </tr>
      </table>
    </div>
  </div>
</div>
</template>

<script>

import api from "../../../utils/api"
import { crono } from 'vue-crono'
import { mapState, mapActions, mapGetters } from 'vuex'
import keys from '../../../utils/keys'

export default {
    mixins: [crono],
    data: function(){
        return {
            loaded: false,
            dataLoaded: false,
            collection: {},
            total: 0,
        }

    },
    computed: {
		...mapGetters('competitions', ['churches']),
        top5L() {
            this.loaded = true;
            return this.collection.filter((it) => it.group === "L").sort((a, b) => b.amountPerDS - a.amountPerDS).slice(0,5)
        },
        top5M() {
            this.loaded = true;
            return this.collection.filter((it) => it.group === "M").sort((a, b) => b.amountPerDS - a.amountPerDS).slice(0,5)
        },
        top5S() {
            this.loaded = true;
            return this.collection.filter((it) => it.group === "S").sort((a, b) => b.amountPerDS - a.amountPerDS).slice(0,5)
        },
        formattedTotal() {
            return this.total.toFixed().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
        }
    },
    methods: {
		...mapActions('competitions', ['bindChurchesRef']),
        async fetchData() {
            let results = await api.sendRequestRaw("GET", `${keys.API.BASE_PATH_V2}api/donationstatus`);
            if (results.status != 200) {
                console.error(results);
                return;
            }

            this.collection = Object.values(results.data.items).map(res => {
                    res.group = this.churches[res.churchId].group
                    return res
            });
            this.total = results.data.totalAmount;

            if (this.loaded) {
                const animationDiv = document.getElementById("animated-wrapper");
                animationDiv.style.setProperty('--x-height', (-1 * animationDiv.offsetHeight).toFixed() + "px");
            }
        },
    },
    cron: {
        time: 15000,
        method: 'fetchData'
    },
    async mounted(){
		await this.bindChurchesRef();
        await this.fetchData();
        this.dataLoaded = true;
    },
}
</script>

<style scoped>
table {
    font-size: 60px;
}

.table-wrapper {
    height: max-content;
    flex: 1;
    overflow: hidden;
    width: 487px;
    height: 505px;
    position: relative;
    top: 285px;
    margin-left:52px;
}

.league-title {
    height: 50px;
    width: 100%;
    position: relative;
    top: 49px;
    font-family: FivoSansBlack;
    font-style: normal;
    font-weight: 900;
    font-size: 48px;
    line-height: 50px;
    color: #000000;
}

.league-l, .league-s, .league-m {
    background-size: cover;
}

.league-l {
    background-image: url(../../../assets/img/blended_paper1.jpg);
}

.league-m {
    background-image: url(../../../assets/img/blended_paper2.jpg);
}

.league-s {
    background-image: url(../../../assets/img/blended_paper3.jpg);
}

.table-wrapper > .overlay-color {
    background: #1A7564;
    mix-blend-mode: screen;
    width: 100%;
    height: 100%;
}

table {
    width: 100%;
    font-family: Fivo Sans;
    font-style: normal;
    font-weight: normal;
    font-size: 32px;
    line-height: 34px;
    color: #000000;
    position: relative;
    top: 97px;
}

td {
}

td.amount {
    font-family: FivoSansBlack;
    font-style: normal;
    font-weight: normal;
    font-size: 32px;
    line-height: 59px;
    text-align: right;
    padding-right: 25px;
}

td.pos {
    padding-left: 25px;
}

td.name, td.pos {
    font-family: Fivo Sans;
    font-style: normal;
    font-weight: normal;
    font-size: 30px;
    line-height: 34px;
    text-align: left;
}

div.total {
    font-size: 205px;
}

div.total-title {
    font-size: 145px;
}

.divider {
    width: 70%;
    border: black 1px solid;
    position: relative;
    top: 60px;
    left: 67px;
}

@font-face {
    font-family: Fivo Sans;
    src: url("../../../assets/fonts/FivoSans-Regular.otf") format("opentype");
}

@font-face {
    font-family: FivoSansBlack;
    src: url("../../../assets/fonts/FivoSans-Black.otf") format("opentype");
}

</style>
