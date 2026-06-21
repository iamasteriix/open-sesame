import { Router } from "express";
import { requestMagicLink } from "./requestMagicLink.controller.js";
import { verifyMagicLink } from "./verifyMagicLink.controller.js";


const magicLinkRouter = Router();

magicLinkRouter.route('/')
  .get(verifyMagicLink)
  .post(requestMagicLink);


export default magicLinkRouter;