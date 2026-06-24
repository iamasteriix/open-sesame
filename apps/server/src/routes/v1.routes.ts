import { Router } from "express";
import diagnosticsRouter from "../modules/diagnostics/routes.js";
import userRouter from "../modules/user/routes.js";
import magicLinkRouter from "../modules/magicLink/routes.js";
import totpRouter from "../modules/totp/routes.js";
import oidcRouter from "../modules/oidc/routes.js";
import interactionRouter from "../modules/interaction/routes.js";


const v1Router = Router();


v1Router.use('/diagnostics', diagnosticsRouter);
v1Router.use('/user', userRouter);
v1Router.use('/magic-link', magicLinkRouter);
v1Router.use('/totp', totpRouter);
v1Router.use('/oidc', oidcRouter);
v1Router.use('/interaction', interactionRouter);


export default v1Router;