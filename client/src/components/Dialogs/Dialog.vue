<template>
    <div class="h-screen w-full fixed top-0 left-0 z-50 flex items-center justify-center bg-dark-75 text-black">
        <div class="bg-background-2-light text-white rounded shadow p-8 m-4 max-w-xs max-h-full text-center">
            <div class="mb-4">
                <slot name="header"></slot>
            </div>
            <div class="mb-8">
                <slot name="body"></slot>
            </div>
            <div class="flex justify-between">
                <slot name="footer">
                </slot>
            </div>
        </div>
    </div>
</template>
<style scoped>
.bg-dark-75 {
    background: #00000075;
}
</style>