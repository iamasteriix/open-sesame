import { Router } from "express";
import diagnosticsRouter from "../modules/diagnostics/routes.js";
import userRouter from "../modules/user/routes.js";
import magicLinkRouter from "../modules/magicLink/routes.js";
import totpRouter from "../modules/totp/routes.js";
import oidcRouter from "../modules/oidc/routes.js";
import interactionRouter from "../modules/interaction/routes.js";


const router = Router();


router.use('/diagnostics', diagnosticsRouter);
router.use('/user', userRouter);
router.use('/magic-link', magicLinkRouter);
router.use('/totp', totpRouter);
router.use('/oidc', oidcRouter);
router.use('/interaction', interactionRouter);


export default router;