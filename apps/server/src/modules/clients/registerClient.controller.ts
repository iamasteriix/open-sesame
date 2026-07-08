import type { Response, NextFunction, } from "express";
import type { ReqBodyRegisterClient } from "./types.js";
import { ErrorCodes } from "@open-sesame/common";
import { AppError } from "../../lib/errors/errors.js";
import { registerClient } from "./clients.services.js";


export const registerClientController = async (
  request: ReqBodyRegisterClient,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {

    const foo = request.body;

    const result = await registerClient(foo);
    if (!result) throw new AppError('Failed to register client', 500, ErrorCodes.internal.code);

    const { client, secret } = result;
    response.status(201).json({ client, secret, });
    return;
    
  } catch (error) {
    return next(error);
  }
}