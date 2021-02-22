<template>
    <section @click.stop="$emit('close')">
        <div class="text-center p-8 white-fade">
            <p class="font-bold font-serif italic text-4xl md:text-6xl uppercase leading-none">{{church.name}},</p>
            <p class="text-3xl md:text-4xl uppercase leading-none">{{church.country}}</p>
        </div>
        <table class="text-2xl md:text-4xl w-full WWR">
            <tr>
                <td class="text-right font-semibold pr-4">TOTAL:</td>
                <td>{{church.distance}} KM</td>
            </tr>
            <tr>
                <td class="text-right font-semibold pr-4">AVERAGE:</td>
                <td>{{church.average}} KM</td>
            </tr>
            <tr>
                <td class="text-right font-semibold pr-4">RANKING:</td>
                <td>#{{church.ranking}} </td>
            </tr>
        </table>
    </section>
</template>
<script>
export default {
    props: {
        church: {
            type: Object,
            required: true
        }
    }
}
</script>