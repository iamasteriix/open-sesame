import type { Provider } from "oidc-provider";
import { Router } from "express";
import { makeGetSigninDetails, submitSignin } from "./signin.controller.js";
import { makeVerifySigninTotp, verifySigninMagicToken } from "./verify-signin.controller.js";
import { handleGetSignup, handleSubmitSignup, } from "./signup.controller.js";
import { makeHandleAllowAccess, makeSubmitConsentController, } from "./allow.controller.js";
import { signoutController } from "./signout.controller.js";
import { verifySignupMagicToken } from "./verify-signup.controller.js";
import { refreshTokenController } from "./refresh-token.controller.js";



export default (oidcProvider: Provider): Router => {
  const router = Router();

  router.route('/signin')
    .get(makeGetSigninDetails(oidcProvider))
    .post(submitSignin);

  router.route('/signin/verify')
    .get(verifySigninMagicToken)
    .post(makeVerifySigninTotp(oidcProvider));

  router.route('/allow')
    .get(makeHandleAllowAccess(oidcProvider))
    .post(makeSubmitConsentController(oidcProvider));

  router.route('/signup')
    .get(handleGetSignup)
    .post(handleSubmitSignup);

  router.get('/signup/verify', verifySignupMagicToken);
  router.post('/refresh', refreshTokenController);
  router.post('/signout', signoutController);

  return router;
}