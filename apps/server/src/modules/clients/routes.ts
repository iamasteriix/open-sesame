import { Router } from "express";
import { getClient, registerClient, revokeClientController, updateClient, } from "./client.controllers.js";
import { makeOnValidateRequests } from "../../middleware/validation/onValidateRequests.js";
import { getClientSchema, registerClientSchema, updateClientSchema } from "./validation.schemas.js";


const clientRouter = Router();


clientRouter.post('/register', makeOnValidateRequests(registerClientSchema), registerClient);

clientRouter.route('/:id')
  .get(makeOnValidateRequests(getClientSchema), getClient)
  .patch(makeOnValidateRequests(updateClientSchema), updateClient);

clientRouter.post('/:id/revoke', makeOnValidateRequests(getClientSchema), revokeClientController);


export default clientRouter;