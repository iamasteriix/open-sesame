import { Router } from "express";
import { enrollTotp } from "./enrollTotp.controller.js";
import { verifyTotp } from "./verifyTotp.controller.js";
import { confirmTotp } from "./confirmTotp.controller.js";


const totpRouter = Router();


totpRouter.post('/enroll', enrollTotp);
totpRouter.post('/confirm', confirmTotp);
totpRouter.post('/verify', verifyTotp);


export default totpRouter;