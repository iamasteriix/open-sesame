import type { Response, NextFunction, } from "express";
import type { ReqBodyRegisterClient } from "./types.js";
import { ErrorCodes } from "@open-sesame/common";
import { registerClient } from "./registerClient.js";
import { AppError, ValidationError } from "../../lib/errors/errors.js";


export const registerClientController = async (
  request: ReqBodyRegisterClient,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {

    const {
      name, logoUrl,
      ownerId,
      redirectUris,
      allowedGrants, allowedScopes,
      isPublic,
    } = request.body;

    if (!redirectUris.length) throw new ValidationError('At least one redirect uri is required');

    const result = await registerClient({
      name, logoUrl,
      ownerId,
      redirectUris,
      allowedGrants, allowedScopes,
      isPublic,
    });
    if (!result) throw new AppError('Failed to register client', 500, ErrorCodes.internal.code);

    const { client, secret } = result;
    response.status(201).json({ client, secret, });
    return;
    
  } catch (error) {
    return next(error);
  }
}