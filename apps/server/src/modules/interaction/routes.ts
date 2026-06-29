import type { Provider } from "oidc-provider";
import { Router } from "express";
import { makeTotpInteraction } from "./makeTotpInteraction.controller.js";
import { makeMagicLinkInteraction } from "./makeMagicLinkInteraction.controller.js";
import { getInteractionDetails } from "./getInteractionDetails.controller.js";
import { makeConsentInteraction } from "./makeConsentInteraction.controller.js";


export default (oidcProvider: Provider): Router => {
  const router = Router();

  router.get('/:uid', getInteractionDetails(oidcProvider));
  router.post('/:uid/consent', makeConsentInteraction(oidcProvider));
  router.post('/:uid/magic-link', makeMagicLinkInteraction(oidcProvider));
  router.post('/:uid/totp', makeTotpInteraction(oidcProvider));

  return router;
}
