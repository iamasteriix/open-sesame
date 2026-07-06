import type { Provider } from "oidc-provider";
import { Router } from "express";
import { signinController } from "./signin.controller.js";
import { makeVerifySigninTotp, verifySigninMagicToken } from "./verify-signin.controller.js";
import { signupController } from "./signup.controller.js";
import { makeAllowController, } from "./allow.controller.js";
import { signoutController } from "./signout.controller.js";
import { verifySignupMagicToken } from "./verify-signup.controller.js";
import { refreshTokenController } from "./refresh-token.controller.js";


export default (oidcProvider: Provider): Router => {
  const router = Router();

  router.post('/signin', signinController);
  router.post('/refresh', refreshTokenController);
  router.route('/signin/verify')
    .get(verifySigninMagicToken)
    .post(makeVerifySigninTotp(oidcProvider));
  router.post('/allow', makeAllowController(oidcProvider));
  router.post('/signup', signupController);
  router.get('/signup/verify', verifySignupMagicToken);
  router.post('/signout', signoutController);

  return router;
}