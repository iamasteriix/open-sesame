import { Router } from "express";
import { signin } from "../../controllers";


const authRouter = Router();


authRouter.route('/signin').get(signin);


export default authRouter;