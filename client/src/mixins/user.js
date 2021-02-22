export default {
    methods: {
        churchAndCountry(user) {
            return `${user.churchName}${this.hasChurchAndCountry(user) ? ', ' : ''}${user.countryName}`
        },
        hasChurchAndCountry(user){
            return user.churchName != null && user.countryName != null && user.countryName.length > 0
        },
        displayName(user){
            return user.displayName == null 
                ? `${user.firstName} ${user.lastName}`
                : user.displayName
        },
    }
}