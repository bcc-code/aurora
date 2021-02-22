<template>
	<section id="screen-wrapper">
		<Login v-if="isLoggedIn == false" :loginError="loginError" @login="init"/>
		<router-view v-if="isMounted"/>
	</section>
</template>

<script>
import { mapActions } from 'vuex';
import firebase from "firebase/app";
import keys from '@/utils/keys';
import "firebase/auth";
import Login from '@/views/LiveScreens/Login.vue'
export default {
	components: {
		Login
	},
	data: function(){
		return {
			isMounted: false,
			isLoggedIn: null,
			loginError: null,
		}
	},
	async mounted(){
		await this.init();
	},
	async beforeDestroy(){
		await firebase.auth().signOut();
	},
	methods: {
		...mapActions('configs', ['bindConfigRef']),
		async bindFirebase() {
			await this.bindConfigRef();
			this.isMounted = true;
		},
		async init() {
			let keyName = "pass";
			let password;

			if ("firebase-" + keys.AUTH0.CLIENT_ID in localStorage) {
				try {
					this.loginError = null
					await firebase.auth().signInWithCustomToken(localStorage.getItem('firebase-' + keys.AUTH0.CLIENT_ID))
					this.isLoggedIn = true
					await this.bindFirebase();
					return;
				}
				catch(e) { 
					localStorage.removeItem(keys.AUTH0.CLIENT_ID);
					localStorage.removeItem('firebase-' + keys.AUTH0.CLIENT_ID);
					window.location.reload();
				}
			}

			if (keyName in localStorage)
				password = localStorage.getItem(keyName)
			else if (keyName in this.$route.query) {
				password = this.$route.query[keyName]
				localStorage.setItem(keyName, password)
			}
			if (password == null) {
				this.isLoggedIn = false;
			}
			else {
				try {
					this.loginError = null;
					await firebase.auth()
					.signInWithEmailAndPassword("screens@bcc.online", password)
					this.isLoggedIn = true;
					await this.bindFirebase();
				}
				catch(e) {
					localStorage.removeItem(keyName);
					this.loginError = "Wrong password";
					this.isLoggedIn = false;
				}
			}
			
		}
	},
	watch: {
		'$route.params.id': {
			immediate: true,
			handler(value) {
				document.title = `Screen ${value} | ${keys.APP.NAME}`;
			}
		}
	}
}
</script>

<style>
:root {
	--background-2: #1d2838;
}
@import url('https://fonts.googleapis.com/css?family=Barlow:400,600,800&display=swap');
#screen-wrapper {
	font-family: 'Barlow';
	min-height: 100vh;
	width: 100%;
	color:#FFF;
	font-size: 150%;
	cursor: url('/cursor.png') 11 11, auto;	
}

/* width */
::-webkit-scrollbar {
	width: 0;
}

/* Track */
::-webkit-scrollbar-track {
	background: rgba(0,0,0,0.1);
}

/* Handle */
::-webkit-scrollbar-thumb {
	background: rgba(0,0,0,0.1);
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
	background: rgba(0,0,0,0.1);
}
</style>