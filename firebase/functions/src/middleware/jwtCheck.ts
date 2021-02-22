import jwt from "express-jwt";
import jwks from "jwks-rsa";

import { config } from "../utils";

export const jwtCheck = (req, res, next) => {
  // get audience header
  var audience = req.headers.audience;
  if (!audience) {
    console.log(
      `audience header missing, falling back to '${config.auth0.clientId}`
    );
    audience = config.auth0.clientId;
  }

  jwt({
    secret: jwks.expressJwtSecret({
      cache: false,
      rateLimit: true,
      jwksRequestsPerMinute: 10,
      jwksUri: `https://${config.auth0.domain}/.well-known/jwks.json`,
    }),
    audience: audience,
    issuer: `https://${config.auth0.domain}/`,
    algorithm: "RS256",
  })(req, res, (err) => {
    if (err) {
      console.error(`Error in jwtCheck: ${err}`);
      res
        .status(401)
        .json({
          error: err,
        })
        .end();
      return;
    }
    if (next) {
      next();
    }
  });
};
