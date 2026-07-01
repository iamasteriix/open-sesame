import type { Response, NextFunction, } from "express";
import type { ReqQueryGetClient } from "./types.js";
import { revokeClient } from "./revokeClient.js";
import { NotFoundError } from "../../lib/errors/errors.js";


export const revokeClientController = async (
  request: ReqQueryGetClient,
  response: Response,
  next: NextFunction,
) => {
  try {
    
    const { id } = request.params;

    const client = await revokeClient(id);
    if (!client) throw new NotFoundError('This client does not exist');

    response.status(200).json(client);
    return;

  } catch (error) {
    return next(error);
  }
}