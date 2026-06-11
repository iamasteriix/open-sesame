import { Router } from "express";
import authRouter from "./auth.js";
import diagnosticsRouter from "./diagnostics.js";


const v1Router = Router();


v1Router.use('/auth', authRouter);
v1Router.use('/diagnostics', diagnosticsRouter);


export default v1Router;