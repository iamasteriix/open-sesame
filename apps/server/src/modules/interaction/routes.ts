import type { Provider } from "oidc-provider";
import { Router } from "express";
import { getInteractionDetails } from "./getInteractionDetails.controller.js";


export default (oidcProvider: Provider): Router => {
  const router = Router();

  router.get('/:uid', getInteractionDetails(oidcProvider));

  return router;
}
