<template>
    <Spinner center />
</template>
<script>
import keys from '@/utils/keys';
import jwtDecode from 'jwt-decode';
import firebase from "firebase/app";
import loadjs from 'loadjs'
export default {
    created: async function(){
        const firebaseToken = this.$route.query.firebaseToken;
        if ( !firebaseToken ) {
            console.log("Houston, we got a problem");
            return
        }

        localStorage.setItem('firebase-' + keys.AUTH0.CLIENT_ID, firebaseToken);
        localStorage.setItem('role', this.$route.query.role);
        await firebase.auth().signInWithCustomToken(firebaseToken);
        this.$store.commit('session/setAuthenticated', true);
        this.$store.commit('session/setFirebaseInfo', jwtDecode(firebaseToken));
        this.$store.commit('session/setUserRole', this.$route.query.role ? atob(this.$route.query.role) : 'viewer');
        const returnUrl = sessionStorage.getItem('returnUrl');
        sessionStorage.removeItem('returnUrl')

        if (returnUrl == null || returnUrl == '/') {
            this.$router.push({ name: 'events' })
        } else {
            location.href = location.origin + returnUrl;
        }
    }
}
</script>
