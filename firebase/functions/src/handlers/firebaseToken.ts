import * as firebaseAdmin from "firebase-admin";
import handler from "./handler";
import { config } from '../utils';
import cookieSession from "cookie-session";
import passport from "passport";
import Auth0Strategy from "passport-auth0";
import { jwtCheck, syncUserAndClaims } from "../middleware";
import { n, UserModel} from "../model/index";
import { Request } from "../types";
const gaxios = require('gaxios');

const strategy = new Auth0Strategy(
	{
		domain: config.auth0.domain,
		clientID: config.auth0.clientId,
		clientSecret: config.auth0.clientSecret,
		callbackURL: config.api.baseUrl + "firebase/callback"
	},
	function(_accessToken, _refreshToken, extraParams, profile, done) {
		profile.accessToken = extraParams.id_token;
		return done(null, profile);
	}
);


const sess = {
	secret: 'bcconlinesecret',
	cookie: {},
	resave: false,
	saveUninitialized: true
};

const firebaseToken = handler();
passport.use(strategy);
firebaseToken.use(cookieSession(sess));
firebaseToken.use(passport.initialize());
firebaseToken.use(passport.session());

passport.serializeUser((user, done) => { done(null, user) });
passport.deserializeUser((user, done) => { done(null, user) });

firebaseToken.get("/", jwtCheck, syncUserAndClaims, async (req: Request, res) => {
	try {
		const firebaseToken = await firebaseAdmin
		.auth()
		.createCustomToken(req.user[n.claims.uid], req.userClaims);
		const userModel = new UserModel(firebaseAdmin.firestore())
		const userRole = await userModel.getters.role(req.user[n.claims.personId]);
		return res.send({ firebaseToken, userRole });
	} catch (err) {
    logger.error({labels: {function: '/'}, err});
		return res.status(500).send({
			message: "Something went wrong acquiring a Firebase token.",
			error: err
		});
	}
});

firebaseToken.get("/login", function(req, res, next) {
	return passport.authenticate("auth0", { scope: "openid email profile church country", audience: config.auth0.apiAudience})(req, res, next);
});

firebaseToken.get("/callback", (req: Request, res, next) => {
	passport.authenticate("auth0", (err, user) => {
		if (err) return next(err);
		if (!user) return res.redirect("./login");
		req.logIn(user, async (err) => {
			if (err) return next(err);
			req.user = user._json;
			const userModel = new UserModel(firebaseAdmin.firestore())
			const userRole = await userModel.getters.role(req.user[n.claims.personId]);
			await syncUserAndClaims(req, res, next)
			const firebaseToken = await firebaseAdmin.auth().createCustomToken(user.id);
			return res.redirect((config.app.baseUrl) + "/callback?accessToken=" + user.accessToken + "&firebaseToken=" + firebaseToken + "&role=" + Buffer.from(userRole).toString('base64'));
		});
	})(req, res, next);
});

firebaseToken.post("/idtoken", async (req, res, _) => {
	try{
		const result = await gaxios.request({
			method: 'POST',
			url: `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${config.api.key}`,
				data: {
				token: req.body.token,
				returnSecureToken: true
			}
		});

		if (result.status == 200 && result.data.idToken) {
			res.send({
				idToken: result.data.idToken,
				refreshToken: result.data.refreshToken,
				expirationDate: Date.now() + parseInt(result.data.expiresIn) * 1000
			});
      return
		}

		res.status(500).send({
			message: "Something went wrong acquiring an ID Token.",
		});
	} catch (e) {
    logger.error({labels: {function: '/idtoken'}, e});
		res.status(500).send({
			message: "Something went wrong acquiring an ID Token.",
    });
	}
});

export { firebaseToken };
