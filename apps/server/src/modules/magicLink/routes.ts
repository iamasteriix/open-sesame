import { Router } from "express";
import { requestMagicLink } from "./requestMagicLink.controller.js";
import { verifyMagicLink } from "./verifyMagicLink.controller.js";
import { onValidateEmail } from "../../middleware/validation/onValidateEmail.js";


const magicLinkRouter = Router();

magicLinkRouter.post('/request', onValidateEmail, requestMagicLink);
magicLinkRouter.get('/verify', verifyMagicLink);


export default magicLinkRouter;