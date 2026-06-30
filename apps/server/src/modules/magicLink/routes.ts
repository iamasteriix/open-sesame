import { Router } from "express";
import { requestMagicLink } from "./requestMagicLink.controller.js";
import { verifyMagicLink } from "./verifyMagicLink.controller.js";


const magicLinkRouter = Router();

magicLinkRouter.post('/request', requestMagicLink);
magicLinkRouter.get('/verify', verifyMagicLink);


export default magicLinkRouter;