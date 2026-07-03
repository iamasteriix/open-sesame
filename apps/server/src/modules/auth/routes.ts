import type { Provider } from "oidc-provider";
import { Router } from "express";
import { signinController } from "./signin.controller.js";
import { makeVerifyTotp, verifyMagicToken } from "./verify-signin.controller.js";
import { signupController } from "./signup.controller.js";
import { makeAuthorizeController, } from "./authorize.controller.js";
import { signoutController } from "./signout.controller.js";


export default (oidcProvider: Provider): Router => {
  const router = Router();

  router.post('/signin', signinController);

  router.route('/signin/verify')
    .get(verifyMagicToken)
    .post(makeVerifyTotp(oidcProvider));

  router.post('/signup', signupController);
  router.post('/allow', makeAuthorizeController(oidcProvider));
  router.post('/signout', signoutController);

  return router;
}