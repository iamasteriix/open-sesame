import type { Response, NextFunction, } from "express";
import type { ReqQueryGetClient } from "./types.js";
import { NotFoundError } from "../../lib/errors/errors.js";
import { findClientById } from "./findClientById.js";


export const getClient = async (
  request: ReqQueryGetClient,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {

    const { id } = request.params;

    const client = await findClientById(id);
    if (!client) throw new NotFoundError('This client does not exist');

    response.status(200).json(client);
    return;
    
  } catch (error) {
    return next(error);
  }
}