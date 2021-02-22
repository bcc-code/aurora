<template>
    <section :class="{
        'grid gap-4' : grid,
        'md:grid-cols-1 lg:grid-cols-2': grid && columns == 2,
        'md:grid-cols-2 lg:grid-cols-3': grid && columns == 3,
        'md:grid-cols-2 lg:grid-cols-4': grid && columns == 4,
        'md:grid-cols-3 lg:grid-cols-5': grid && columns == 5,
        'md:grid-cols-3 lg:grid-cols-6': grid && columns == 6,
        'md:grid-cols-4 lg:grid-cols-7': grid && columns == 7,
        'md:grid-cols-4 lg:grid-cols-8': grid && columns == 8,
        'md:grid-cols-5 lg:grid-cols-9': grid && columns == 9,
        'md:grid-cols-5 lg:grid-cols-10': grid && columns == 10,
        }">
        <slot></slot>
    </section>
</template>
<script>
export default {
    props: {
        entity: { type: Object },
        grid: { type: Boolean, default: false },
        columns: { type: Number, default: 3 },
        labelRoot: { type: String, required: false }
    }
}
</script>