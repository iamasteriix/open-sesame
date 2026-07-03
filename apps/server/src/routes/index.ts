import type { Provider } from "oidc-provider";
import { Router } from "express";
import { onVerifyClientSecret } from "../middleware/validation/onVerifyClientSecret.js";
import diagnosticsRouter from "../modules/diagnostics/routes.js";
import interactionRouter from "../modules/interaction/routes.js";
import clientRouter from "../modules/clients/routes.js";
import authRouter from "../modules/auth/routes.js";


export default (oidcProvider: Provider): Router => {
  const router = Router();

  router.use('/oidc', onVerifyClientSecret, oidcProvider.callback());
  router.use('/interaction', interactionRouter(oidcProvider));
  router.use('/auth', authRouter(oidcProvider));
  router.use('/clients', clientRouter);
  router.use('/diagnostics', diagnosticsRouter);

  return router;
};