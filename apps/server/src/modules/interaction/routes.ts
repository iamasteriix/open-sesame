import type { Provider } from "oidc-provider";
import { Router } from "express";
import { makeDispatchInteraction, } from "./interaction.controller.js";


export default (oidcProvider: Provider): Router => {
  const router = Router();

  router.get('/:uid', makeDispatchInteraction(oidcProvider));

  return router;
}
