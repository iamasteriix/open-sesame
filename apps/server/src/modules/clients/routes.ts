import { Router } from "express";
import { registerClientController } from "./registerClient.controller.js";
import { getClient } from "./getClient.controller.js";
import { updateClient } from "./updateClient.controller.js";
import { revokeClientController } from "./revokeClient.controller.js";


const clientRouter = Router();


clientRouter.post('/', registerClientController);

clientRouter.route('/:id')
  .get(getClient)
  .patch(updateClient);

clientRouter.post('/', revokeClientController);


export default clientRouter;