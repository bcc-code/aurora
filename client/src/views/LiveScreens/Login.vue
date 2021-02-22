<template>
    <section class="absolute w-full top-0">
        <div class="absolute top-0 w-full h-full bg-background-1 font-sans text-label-1 min-h-screen"></div>
        <div class="container mx-auto px-4 h-full">
            <div class="flex content-center items-center justify-center h-full">
                <div class="w-full lg:w-4/12 px-4 pt-32">
                    <div class="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-gray-300 border-0">
                        <div class="flex-auto px-4 lg:px-10 py-10">
                            <form>
                                <div class="relative w-full mb-3">
                                    <label class="block uppercase text-gray-700 text-xs font-bold mb-2" for="grid-password">Password</label>
                                    <input type="password" v-model="password" class="px-3 py-3 placeholder-gray-400 text-gray-700 bg-white rounded text-sm shadow focus:outline-none focus:shadow-outline w-full" placeholder="Password" style="transition: all 0.15s ease 0s;">
                                    <span class="text-red-500 text-xs" v-if="loginError">{{loginError}}</span>
                                </div>
                                <div class="text-center mt-6">
                                    <button class="bg-gray-900 text-white active:bg-gray-700 text-sm font-bold uppercase px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 w-full" type="button" style="transition: all 0.15s ease 0s;"
                                        @click="signIn">Sign In</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>
<script>
export default {
    data: function() {
        return {
            password: null
        }
    },
    props: ['loginError'],
    methods: {
        signIn() {
            localStorage.setItem('pass', this.password);
            this.$emit('login');
        }
    }
}
</script>