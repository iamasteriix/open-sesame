import { Router } from "express";
import { onHealthStatus } from "../../middleware/diagnostics/onHealthStatus.js";



const diagnosticsRouter = Router();


diagnosticsRouter.route('/health').get(onHealthStatus);


export default diagnosticsRouter;