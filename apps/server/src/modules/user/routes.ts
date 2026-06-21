import { Router } from "express";
import { signinController } from "./signin.controller.js";


const userRouter = Router();


userRouter.route('/signin').get(signinController);


export default userRouter;