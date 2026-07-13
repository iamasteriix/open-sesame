import type { Provider } from "oidc-provider";
import { Router } from "express";
import { submitSignin } from "./signin.controller.js";
import { makeVerifySigninTotp, verifySigninMagicToken } from "./verify-signin.controller.js";
import { handleSubmitSignup, } from "./signup.controller.js";
import { makeSubmitConsentController, } from "./allow.controller.js";
import { signoutController } from "./signout.controller.js";
import { verifySignupMagicToken } from "./verify-signup.controller.js";
import { refreshTokenController } from "./refresh-token.controller.js";
import { makeOnValidateRequests } from "../../middleware/validation/onValidateRequests.js";
import {
  getVerifySigninSchema, refreshTokenSchema, signinSchema, signupSchema,
  submitVerifySigninSchema,
} from "./validation.schemas.js";



export default (oidcProvider: Provider): Router => {
  const router = Router();

  router.post('/signin', makeOnValidateRequests(signinSchema), submitSignin);

  router.route('/signin/verify')
    .get(makeOnValidateRequests(getVerifySigninSchema), verifySigninMagicToken)
    .post(makeOnValidateRequests(submitVerifySigninSchema), makeVerifySigninTotp(oidcProvider));

  router.post('/allow', makeSubmitConsentController(oidcProvider));

  router.post('/signup', makeOnValidateRequests(signupSchema), handleSubmitSignup);
  router.get('/signup/verify', makeOnValidateRequests(getVerifySigninSchema), verifySignupMagicToken);

  router.post('/refresh', makeOnValidateRequests(refreshTokenSchema), refreshTokenController);
  
  router.post('/signout', makeOnValidateRequests(refreshTokenSchema), signoutController);

  return router;
}