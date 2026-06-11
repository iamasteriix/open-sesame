import { Router } from "express";
import { signinController } from "../../controllers/auth/signin.controller.js";


const authRouter = Router();


authRouter.route('/signin').get(signinController);


export default authRouter;