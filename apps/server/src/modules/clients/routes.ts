import { Router } from "express";
import { registerClientController } from "./registerClient.controller.js";
import { getClient } from "./manage-client.controller.js";
import { updateClient } from "./updateClient.controller.js";
import { revokeClientController } from "./revokeClient.controller.js";


const clientRouter = Router();


clientRouter.post('/register', registerClientController);

clientRouter.route('/:id')
  .get(getClient)
  .patch(updateClient);

clientRouter.post('/', revokeClientController);


export default clientRouter;