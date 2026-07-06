import type { Provider } from "oidc-provider";
import { Router } from "express";
import { makeInteractionDispatch } from "./interaction-dispatch.controller.js";


export default (oidcProvider: Provider): Router => {
  const router = Router();

  router.get('/:uid', makeInteractionDispatch(oidcProvider));

  return router;
}
