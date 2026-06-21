import { Router } from "express";
import diagnosticsRouter from "../modules/diagnostics/routes.js";
import userRouter from "../modules/user/routes.js";
import magicLinkRouter from "../modules/magicLink/routes.js";
import totpRouter from "../modules/totp/routes.js";


const v1Router = Router();


v1Router.use('/diagnostics', diagnosticsRouter);
v1Router.use('/user', userRouter);
v1Router.use('/magic-link', magicLinkRouter);
v1Router.use('/totp', totpRouter);


export default v1Router;