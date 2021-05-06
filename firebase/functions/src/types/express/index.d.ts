declare namespace Express {
  interface User {
    aud: string
    birthdate: string
    email: string
    email_verified: boolean
    exp: number
    family_name: string
    gender: ("male"|"female")
    given_name: string
    "https://login.bcc.no/claims/hasMembership": boolean
    "https://login.bcc.no/claims/personId": number
    "https://members.bcc.no/app_metadata": {
      hasMembership: boolean,
        personId: number
    }
    iat: number
    iss: string
    locale: string
    name: string
    nickname: string
    picture: string
    sub: string
    updated_at: string
  }
}
