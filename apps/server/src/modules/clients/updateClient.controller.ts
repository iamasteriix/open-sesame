import type { Response, NextFunction, } from "express";
import type { ReqUpdateClient } from "./types.js";
import { ErrorCodes } from "@open-sesame/common";
import { AppError } from "../../lib/errors/errors.js";
import { updateClientData } from "./updateClientData.js";


export const updateClient = async (
  request: ReqUpdateClient,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {

    const { id } = request.params;
    const {
      name, logoUrl,
      redirectUris,
      allowedGrants, allowedScopes,
      isPublic,
    } = request.body;

    const result = await updateClientData({
      id,
      name, logoUrl,
      redirectUris,
      allowedGrants, allowedScopes,
      isPublic,
    });
    if (!result) throw new AppError('Failed to update client', 500, ErrorCodes.internal.code);

    const { client, secret, } = result;
    response.status(200).json({ client, secret, });
    return;
    
  } catch (error) {
    return next(error);
  }
}