import { firestoreAction  } from 'vuexfire'
import { db } from '@/data/db.js'

export default {
    namespaced: true,
    state: {
        profilePictures: [],
    },
    actions: {
        bindUsersRef: firestoreAction(context => {
            return context.bindFirestoreRef('profilePictures', context.getters.usersRef
                .where('profilePictureThumb', '>', 'https://firebasestorage.googleapis.com/')
                .where('profilePictureThumb', '<', 'null'))
        }),
        rejectProfilePicturesRef: firestoreAction((context, users) => {
            var batch = db.batch();
            users.forEach((user) => {
                batch.update(context.getters.usersRef.doc(user.id), { profilePicture: null, profilePictureThumb: null, updatedAt: Date.now() });
            });
            return batch.commit();
        })
    },
    getters: {
        usersRef: () => {
            return db.collection('users')
        },
        checkedInProfilePictures: (state, getters, rootState) => {
            return state.profilePictures.filter((el) => rootState.checkins.checkins.some((c) => c.personId == el.personId))
        },
        getRandomPictures: (state, getters) => (number) => {
            if (getters.checkedInProfilePictures.length == 0)
                return []
            var result = []
            for(var i = 0; i < number; i++){
                result.push(Object.assign({}, getters.checkedInProfilePictures[Math.floor(Math.random() * Math.floor(getters.checkedInProfilePictures.length))]))
            }
            return result;
        },
        userByPersonId: (_s, getters) => (personId) => {
            return getters.usersRef.doc(`${personId}`)
        }
    }
}