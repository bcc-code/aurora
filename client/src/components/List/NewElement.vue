<template>
    <li class="mb-2">
        <div class="list-item bg-background-2 justify-between">
            <div class="w-1/2 flex items-center">
                <div class="list-item-order"><span class="number">{{order}}</span></div>
                <input type="text" class="form-input" v-model="elementText" :placeholder="placeholder"/>
            </div>
            <slot></slot>
            <span class="btn btn-add" @click="addElement"><i class="fa fa-plus"></i></span>
        </div>
    </li>
</template>
<script>
export default {
    props:[ 'order'],
    data: function() {
        return {
            elementText: ''
        }
    },
    computed: {
        placeholder(){
            return this.$t("element.add")
        },
    },
    methods: {
        addElement(){
            this.$emit('add', { order: this.order, text: this.elementText})
            this.elementText = '';
        }
    }
}
</script>