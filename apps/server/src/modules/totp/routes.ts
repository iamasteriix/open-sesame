import { Router } from "express";
import { enrollTotp } from "./enrollTotp.controller.js";
import { verifyTotp } from "./verifyTotp.controller.js";
import { confirmTotp } from "./confirmTotp.controller.js";
import { revokeTotp } from "./revokeTotp.controller.js";
import { onValidateEmail } from "../../middleware/validation/onValidateEmail.js";


const totpRouter = Router();


totpRouter.post('/enroll', onValidateEmail, enrollTotp);
totpRouter.post('/confirm', confirmTotp);
totpRouter.post('/verify', verifyTotp);
totpRouter.post('/revoke', revokeTotp);


export default totpRouter;