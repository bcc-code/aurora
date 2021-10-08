<template>
<div style="background-color: magenta;">
   <div  v-if="dataLoaded">
    <div class="title">Totalt innsamlet</div>
    <div class="result">{{ formattedTotal }} kr</div>
  </div>
</div>
</template>

<script>

import api from "../../../utils/api"
import { crono } from 'vue-crono'
import keys from '../../../utils/keys'

export default {
    mixins: [crono],
    data: function(){
        return {
            loaded: false,
            dataLoaded: false,
            total: 0,
        }

    },
    computed: {
        formattedTotal() {
            return this.total.toFixed().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        }
    },
    methods: {
        async fetchData() {
            let results = await api.sendRequestRaw("GET", `${keys.API.BASE_PATH_V2}api/donationstatus`);
            if (results.status != 200) {
                console.error(results);
                return;
            }

            this.total = results.data.totalAmount;
        },
    },
    cron: {
        time: 15000,
        method: 'fetchData'
    },
    async mounted(){
        await this.fetchData();
        this.dataLoaded = true;
        console.log(this.dataLoaded);
    },
}
</script>

<style scoped>
.title {
    position: absolute;
    width: 482px;
    height: 67px;
    left: calc(50% - 482px/2);
    top: calc(50% - 67px/2 - 100.5px);

     font-family: Fivo Sans;
     font-style: normal;
     font-weight: normal;
     font-size: 64px;
     line-height: 67px;
     text-align: center;

color: #B4B1AA;
}

.result {
position: absolute;
width: 100%;
height: 179px;
left: 0;
top: calc(50% - 179px/2 + 35.5px);

font-family: FivoSansBlack;
font-style: normal;
font-weight: 900;
font-size: 170px;
line-height: 178px;
/* identical to box height */

text-align: center;

color: #FFFFFF;
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
