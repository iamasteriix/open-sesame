import { Router } from "express";
import authRouter from "./auth";


const v1Router = Router();


v1Router.use('/auth', authRouter);


export default v1Router;