import Vue from "vue"
import Router from "vue-router"
import routes from "./routes"
import store from '../store/index'
import firebase from "firebase/app";
import keys from '@/utils/keys';
import "firebase/auth";
import abilities from '@/utils/ability'
import jwtDecode from 'jwt-decode'
Vue.use(Router)

export const router = new Router({
	mode: 'history',
	routes: routes
})

router.beforeEach(async (to, from, next) => {
    if (to.meta.unprotected) next()
	else if (store.state.session.userInfo == null
		|| store.state.session.firebaseInfo == null
		|| Date.now() > store.state.session.userInfo.exp * 1000
		|| Date.now() > store.state.session.firebaseInfo.exp * 1000){
		if (localStorage.getItem('firebase-' + keys.AUTH0.CLIENT_ID)) {
			await firebase.auth()
				.signInWithCustomToken(localStorage.getItem('firebase-' + keys.AUTH0.CLIENT_ID))
				.catch(() => {
					localStorage.removeItem(keys.AUTH0.CLIENT_ID);
					localStorage.removeItem('firebase-' + keys.AUTH0.CLIENT_ID);
					localStorage.removeItem('role');
					window.location.reload();
				});
			store.commit('session/setAuthenticated', true);
			//store.commit('session/setUserInfo', jwtDecode(localStorage.getItem(keys.AUTH0.CLIENT_ID)));
			store.commit('session/setFirebaseInfo', jwtDecode(localStorage.getItem('firebase-' + keys.AUTH0.CLIENT_ID)));
			store.commit('session/setUserRole', localStorage.getItem('role') ? atob(localStorage.getItem('role')) : 'viewer');
			next();
		}
		else {
			sessionStorage.setItem('returnUrl', location.pathname);
			location.href = keys.API.BASE_PATH + `firebase/login`;
		}
	}
	if (!(to.meta.accessLevel == null || abilities.can(to.meta.accessLevel)))
		next({ name: 'unauthorized' });
    else next();
});
