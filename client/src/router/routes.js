import Events from "@/views/Events/List"
import Event from "@/views/Events/Single"
import EditEvent from "@/views/Events/EditEvent"

import EventTemplates from "@/views/Events/Templates/List"
import EventTemplate from "@/views/Events/Templates/Single"

import Questions from "@/views/Events/Modules/Questions"
import Inquiries from "@/views/Events/Modules/Inquiries/Index"
import Translation from '@/views/Events/Modules/Translation'
import Feed from '@/views/Events/Modules/Feed/Index'
import Queue from '@/views/Events/Modules/Feed/Queue'
import Info from '@/views/Events/Modules/Feed/Info'
import Program from '@/views/Events/Modules/Program'
import ManageScreens from '@/views/Events/Modules/Screens/Index'

import ProfilePictures from '@/views/Events/Modules/ProfilePictures'
import CompetitionValidation from '@/views/Events/Modules/CompetitionValidation'

import LiveScreen from '@/views/LiveScreens/Index'

import Callback from '@/views/Callback'
import Unauthorized from '@/views/Unauthorized'
import NotFound from "@/views/NotFound"

export default [
	{ path: "/", name: "events", component: Events },
	{ path: "/callback", name: "callback", component: Callback, meta: { unprotected: true }},
	{ path: '/unauthorized', name: 'unauthorized', component: Unauthorized, meta: { unprotected: true } },
	{ path: "/screens/:id", name: "livescreen", component: LiveScreen, meta: { unprotected: true } },
	{ path: "/templates", name: "templates", component: EventTemplates },
	{ path: "/templates/:templateId", name: "template", component: EventTemplate },
	{ path: "/:eventId", component: Event, children: [
		{ path: "", name: "dashboard", component: EditEvent },
		{ path: "gameboard", name: "gameboard", component: Questions },
		{ path: "translations",	name: "translations", component: Translation, meta: { accessLevel : 'translate' } },
		{ path: "inquiries", name: "inquiries", component: Inquiries },
		{ path: "feed", name: "feed", component: Feed, meta: { accessLevel : 'desk' } },
		{ path: "desk", name: "desk", component: Info, meta: { accessLevel : 'desk' } },
		{ path: "program", name: "program", component: Program },
		{ path: "screens", name: "screens", component: ManageScreens, meta: { accessLevel : 'admin' } },
		{ path: "profile-pictures",	name: "profile-pictures", component: ProfilePictures, meta: { accessLevel : 'desk' } },
		{ path: "competition", name: "competition", component: CompetitionValidation, meta: { accessLevel : 'desk' } }
	]},
	{ path: "*", name: "not-found", component: NotFound }
]