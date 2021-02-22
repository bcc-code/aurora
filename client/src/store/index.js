import Vue from 'vue'
import Vuex from 'vuex'

import questions from '@/store/questions'
import gameboard from '@/store/gameboard'
import program from '@/store/program'
import screens from '@/store/screens'
import contributions from '@/store/contributions'
import session from '@/store/session'
import checkins from '@/store/checkins'
import events from '@/store/events'
import users from '@/store/users'
import configs from '@/store/configs'
import competitions from '@/store/competitions'
import inquiries from '@/store/inquiries'
import bukgames from '@/store/bukgames'
import translation from '@/store/translation'
import templates from '@/store/templates'
import { vuexfireMutations } from 'vuexfire'

Vue.use(Vuex)
export default new Vuex.Store({
    modules: {
        events,
        questions,
        gameboard,
        checkins,
        contributions,
        session,
        program,
        screens,
        users,
        configs,
        competitions,
        inquiries,
        bukgames,
        translation,
        templates
    },
    mutations: {
        ...vuexfireMutations
    }
})