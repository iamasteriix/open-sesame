import { Router } from "express";
import { createOidcProvider } from "../lib/oidc/oidcProvider.js";
import { logger } from "../config/logger.js";
import diagnosticsRouter from "../modules/diagnostics/routes.js";
import magicLinkRouter from "../modules/magicLink/routes.js";
import totpRouter from "../modules/totp/routes.js";
import interactionRouter from "../modules/interaction/routes.js";


export default async (): Promise<Router> => {
  const router = Router();

  // oidc provider routes need to share the same instance
  const oidcProvider = await createOidcProvider();
  
  // not having this event listener cost me a egregious amount of time trying to find out why the oidc provider kept breaking
  oidcProvider.on('server_error', (context, error) => {
    logger.error({
        err: error,
        path: context?.path,
      },
      'OIDC provider internal error'
    );
  });
  router.use('/oidc', oidcProvider.callback());
  router.use('/interaction', interactionRouter(oidcProvider));
  
  router.use('/diagnostics', diagnosticsRouter);
  router.use('/magic-link', magicLinkRouter);
  router.use('/totp', totpRouter);

  return router;
};