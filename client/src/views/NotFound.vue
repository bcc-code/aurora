<template>
      <div class="container mx-auto">
            <div class="flex justify-center px-6 my-12">
                  <div class="w-full xl:w-3/4 lg:w-11/12 flex">
                        <div class="w-full h-auto hidden lg:block lg:w-1/2">
                              <img class="rounded-l-lg" src="https://source.unsplash.com/K4mSJ7kc0As/600x800">
                        </div>
                        <div class="w-full lg:w-1/2 bg-background-2 p-5 rounded-lg lg:rounded-l-none">
                              <h3 class="pt-12 text-4xl font-bold text-center">{{$t('not-found.title')}}</h3>
                              <p class="pt-12 text-2xl text-center">{{$t('not-found.details')}}</p>
                              <p class="pt-4 pb-12 text-md text-center" v-html="$t('not-found.go-to-homepage')"></p>
                        </div>
                  </div>
            </div>
      </div>
</template>