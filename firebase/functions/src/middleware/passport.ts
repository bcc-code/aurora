import Auth0Strategy, {
    ExtraVerificationParams,
    VerifyFunctionWithRequest,
} from 'passport-auth0'
import passport, { PassportStatic, Profile } from 'passport'
import { getConfig } from '../utils'

const sessionSettings = {
    secret: 'bcconlinesecret', // TODO: Make this secret
    cookie: {},
    resave: false,
    saveUninitialized: true,
}

async function configurePassport() : Promise<PassportStatic> {
    const config = await getConfig();
    const strategy = new Auth0Strategy(
        {
            domain: config.auth0.domain,
            clientID: config.auth0.clientId,
            clientSecret: config.auth0.clientSecret,
            callbackURL: config.api.baseUrl + 'firebase/callback',
        },
        (
            _accessToken: string,
            _refreshToken: string,
            extraParams: ExtraVerificationParams,
            profile: Profile,
            done: VerifyFunctionWithRequest
        ) => {
            profile.accessToken = extraParams.id_token
            return done(null, profile)
        }
    )

    passport.use(strategy)
    passport.serializeUser((user, done) => {
        done(null, user)
    })
    passport.deserializeUser((user, done) => {
        done(null, user)
    })

    return passport
}


export { configurePassport, sessionSettings }
