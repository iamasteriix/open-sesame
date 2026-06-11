import { Router } from "express";
import { signinController } from "../../controllers/index.js";


const authRouter = Router();


authRouter.route('/signin').get(signinController);


export default authRouter;