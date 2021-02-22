import { AbilityBuilder, Ability } from '@casl/ability'
import store from '@/store'

function subjectName(item) {
    return item
}

const ability = new Ability([], { subjectName })

let userRole;
store.subscribe((mutation, state) => {
	if (mutation.type == 'session/setUserRole') {
		const prevUserRole = userRole
		userRole = state.session.userRole

		if (prevUserRole !== userRole) {
			ability.update(defineRulesFor(userRole))
		}
	}
});

function defineRulesFor(userRole) {
	const { can, rules } = AbilityBuilder.extract()
	if (userRole == "translator") 
		can(['translate'], 'all')
	if (userRole == "desk")
		can(['desk'], 'all')
	if (userRole == "administrator") 
		can(['read', 'update', 'delete', 'create', 'translate','desk', 'admin'], 'all')

	return rules
}

export default ability