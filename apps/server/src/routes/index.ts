import { Router } from "express";
import { createOidcProvider } from "../lib/oidc/oidcProvider.js";
import diagnosticsRouter from "../modules/diagnostics/routes.js";
import magicLinkRouter from "../modules/magicLink/routes.js";
import totpRouter from "../modules/totp/routes.js";
import interactionRouter from "../modules/interaction/routes.js";


export default async (): Promise<Router> => {
  const router = Router();

  // oidc provider routes need to share the same instance
  const oidcProvider = await createOidcProvider();
  router.use('/oidc', oidcProvider.callback());
  router.use('/interaction', interactionRouter(oidcProvider));

  router.use('/diagnostics', diagnosticsRouter);
  router.use('/magic-link', magicLinkRouter);
  router.use('/totp', totpRouter);

  return router;
};