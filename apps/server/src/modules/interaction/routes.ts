import { Router } from "express";
import { makeTotpInteraction } from "./makeTotpInteraction.controller.js";
import { makeMagicLinkInteraction } from "./makeMagicLinkInteraction.controller.js";


const interactionRouter = Router();


interactionRouter.post('/:uid/totp', makeTotpInteraction);
interactionRouter.post('/:uid/magic-link', makeMagicLinkInteraction);


export default interactionRouter;