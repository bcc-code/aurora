export default {
    namespaced: true,
    state: {
        userInfo: null,
        firebaseInfo: null,
        userRole: null,
        appLanguage: localStorage.getItem('appLanguage') || 'no',
        isAuthenticated: false,
        profileOpen: false
    },
    mutations: {
        setUserInfo: (state, value) => state.userInfo = value,
        setFirebaseInfo: (state, value) => state.firebaseInfo = value,
        setUserRole: (state, value) => state.userRole = value,
        setAuthenticated: (state, value) => state.isAuthenticated = value,
        setAppLanguage: (state, value) => {
            localStorage.setItem('appLanguage', value);
            state.appLanguage = value;
        },
        setProfileOpen: (state, value) => state.profileOpen = value,
    },
    actions: {
        updateUserInfo: ({ commit }, userInfo) => { commit('setUserInfo', userInfo) },
        openProfile: ({ commit }) => { commit('setProfileOpen', true) },
        closeProfile: ({ commit }) => { commit('setProfileOpen', false) },
        toggleProfile: ({ state, dispatch }) => { state.profileOpen ? dispatch('closeProfile') : dispatch('openProfile') },
    },
    getters: {
        userRef: (state, getters, rootState, rootGetters) => {
            return rootGetters['users/usersRef'].doc(getters.personId.toString());
        },
        personId: (state) => {
            return state.userInfo['https://login.bcc.no/claims/personId'];
        },
    }
}