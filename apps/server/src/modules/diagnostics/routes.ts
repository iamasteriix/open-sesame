import { Router } from "express";
import { healthController } from "./health.controller.js";



const diagnosticsRouter = Router();


diagnosticsRouter.route('/health').get(healthController);


export default diagnosticsRouter;