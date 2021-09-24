<template>
<div>
   <div class="scroll-animate" id="animated-wrapper" v-if="dataLoaded">
    <div class="table-wrapper" >
       <table>
            <tr v-for="(value,index) in sortedByDS" :key="value.churchId" v-if="value.amountPerDS > 0">
                <td :class="'nr' + index">{{ index + 1 }}</td>
                <td :class="'nr' + index">{{ churches[value.churchId].name }} </td>
                <td :class="'nr' + index" class="amount">{{ value.amountPerDS }} kr/DS</td>
            </tr>
      </table>
    </div>
    <div class="table-wrapper">
      <div class="total-title">Totalt innsamlet:</div>
      <div class="total">{{ formattedTotal }} kr</div>
    </div>
  </div>
</div>
</template>

<script>

import api from "../../../utils/api"
import { crono } from 'vue-crono'
import { mapState, mapActions, mapGetters } from 'vuex'

export default {
    mixins: [crono],
    data: function(){
        return {
            loaded: false,
            dataLoaded: false,
            collection: {},
        }

    },
    computed: {
		...mapGetters('competitions', ['churches']),
        sortedByDS() {
            this.loaded = true;
            return Object.values(this.collection.items).sort((a, b) => b.amountPerDS - a.amountPerDS)
        },
        formattedTotal() {
            let x = this.collection.totalAmount;
            return x.toFixed().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
        }
    },
    watch: {
        loaded() {
            const animationDiv = document.getElementById("animated-wrapper");
            animationDiv.style.setProperty('--height', (-1 * animationDiv.offsetHeight).toFixed() + "px");
        }
    },
    methods: {
		...mapActions('competitions', ['bindChurchesRef']),
        async fetchData() {
            let results = await api.sendRequestRaw("GET", "http://localhost:8000/api/donationstatus");
            if (results.status != 200) {
                console.error(results);
                return;
            }

            this.collection = results.data;
            if (this.loaded) {
                const animationDiv = document.getElementById("animated-wrapper");
                animationDiv.style.setProperty('--height', (-1 * animationDiv.offsetHeight).toFixed() + "px");
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
    border-radius: 65px;
    background-color: rgba(100, 100, 100, 0.3);
    padding: 60px;
    margin: 25px;
    width: 1400px;
    height: max-content;
    overflow: hidden;
}

table {
    width: 100%;
}

td {
    padding-left: 20px;
    padding-right: 20px;
}

td.amount {
    min-width: 350px;
}

@keyframes moveUp {
	0% {
        transform: translateY(1080px);
    }
	100% {
        transform: translateY(var(--height));
	}
}

.scroll-animate {
  animation: moveUp linear infinite;
  animation-duration: 90s;
  height: max-content;
}

td.nr0 {
    padding-top: 12px;
}

div.total {
    font-size: 205px;
}

div.total-title {
    font-size: 145px;
}

</style>
