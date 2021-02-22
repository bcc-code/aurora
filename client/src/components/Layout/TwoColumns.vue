<template>
    <div class="grid grid-cols-1 gap-4 items-start lg:grid-cols-3 lg:gap-8">
        <div class="grid grid-cols-1 gap-4 lg:col-span-2">
            <section aria-labelledby="section-1-title">
                <div class="rounded-lg bg-white overflow-hidden shadow">
                    <div class="p-6">
                        <slot name="main-column"></slot>
                    </div>
                </div>
            </section>
        </div>

        <!-- Right column -->
        <div class="grid grid-cols-1 gap-4">
            <section aria-labelledby="section-2-title">
                <div class="rounded-lg bg-white overflow-hidden shadow">
                    <div class="p-6">
                        <slot name="side-column"></slot>
                    </div>
                </div>
            </section>
        </div>
    </div>
</template>