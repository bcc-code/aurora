<template>
    <div class="flex justify-center">
        <div class="loader" :class="{ 'centered' : center }"/>
    </div>
</template>
<script>
export default {
    props: {
        center: {
            type: Boolean
        }
    }
}
</script>
<style>
    .loader {
        border-radius: 50%;
        width: 1.5em;
        height: 1.5em;
    }
    .loader {
        position: relative;
        text-indent: -9999em;
        border-top: .1em solid currentColor;
        border-right: .1em solid currentColor;
        border-bottom: .1em solid currentColor;
        border-left: .1em solid transparent;
        -webkit-transform: translateZ(0);
        -ms-transform: translateZ(0);
        transform: translateZ(0);
        -webkit-animation: load8 1.1s infinite linear;
        animation: load8 1.1s infinite linear;
    }
    .centered {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    }
    @keyframes load8 {
        0% {
            -webkit-transform: rotate(0deg);
            transform: rotate(0deg);
        }
        100% {
            -webkit-transform: rotate(360deg);
            transform: rotate(360deg);
        }
    }
</style>