export default {
    methods: {
        churchAndCountry(user) {
            return `${user.ChurchName}${this.hasChurchAndCountry(user) ? ', ' : ''}${user.CountryName}`
        },
        hasChurchAndCountry(user){
            return user.ChurchName != null && user.CountryName != null && user.CountryName.length > 0
        },
        displayName(user){
            return user.DisplayName == null
                ? `${user.FirstName} ${user.LastName}`
                : user.DisplayName
        },
    }
}
