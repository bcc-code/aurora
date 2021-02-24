<template>
    <Spinner center />
</template>
<script>
import keys from '@/utils/keys';
import jwtDecode from 'jwt-decode';
import firebase from "firebase/app";
import loadjs from 'loadjs'
export default {
    methods: {
        async registerSignOutUrl () {
            return new Promise((resolve, reject) => {
                loadjs("https://auth.bcc.no/signout/js", {
                    async: false,
                    error: function (path) {
                        return reject(null);
                    },
                    success: function () {
                        return resolve();
                    },
                    before: function (path, element) {
                        element.setAttribute("signout-path", "/signout");
                        document.body.appendChild(element);
                        return false;
                    }
                });

            });
        }
    },
    created: async function(){
        await this.registerSignOutUrl().catch(function (err) {
            console.error('Could not register signout path');
        });
        const accessToken = this.$route.query.accessToken;
        const firebaseToken = this.$route.query.firebaseToken;
        if ( accessToken && firebaseToken) {
            localStorage.setItem(keys.AUTH0.CLIENT_ID, accessToken);
            localStorage.setItem('firebase-' + keys.AUTH0.CLIENT_ID, firebaseToken);
            localStorage.setItem('role', this.$route.query.role);
            await firebase.auth().signInWithCustomToken(firebaseToken);
            this.$store.commit('session/setAuthenticated', true);
            this.$store.commit('session/setUserInfo', jwtDecode(accessToken));
            this.$store.commit('session/setFirebaseInfo', jwtDecode(firebaseToken));
            this.$store.commit('session/setUserRole', this.$route.query.role ? atob(this.$route.query.role) : 'viewer');
            const returnUrl = sessionStorage.getItem('returnUrl');
            sessionStorage.removeItem('returnUrl')
            if (returnUrl == null || returnUrl == '/')
                this.$router.push({ name: 'events' })
            else
                location.href = location.origin + returnUrl;
        }
        else {
            console.log("Houston, we got a problem");
        }
    }
}
</script>