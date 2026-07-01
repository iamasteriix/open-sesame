import type { Provider } from "oidc-provider";
import { Router } from "express";
import { onVerifyClientSecret } from "../middleware/validation/onVerifyClientSecret.js";
import diagnosticsRouter from "../modules/diagnostics/routes.js";
import magicLinkRouter from "../modules/magicLink/routes.js";
import totpRouter from "../modules/totp/routes.js";
import interactionRouter from "../modules/interaction/routes.js";
import clientRouter from "../modules/clients/routes.js";


export default (oidcProvider: Provider): Router => {
  const router = Router();

  router.use('/oidc', onVerifyClientSecret, oidcProvider.callback());
  router.use('/interaction', interactionRouter(oidcProvider));
  router.use('/diagnostics', diagnosticsRouter);
  router.use('/magic-link', magicLinkRouter);
  router.use('/totp', totpRouter);
  router.use('/clients', clientRouter)

  return router;
};