import type { Response, NextFunction, } from "express";
import type { ReqBodyRegisterClient, ReqGenericsUpdateClient, ReqQueryGetClient } from "./types.js";
import { ErrorCodes } from "@open-sesame/common";
import { AppError, NotFoundError, } from "../../lib/errors/errors.js";
import { findClientById, revokeClient, submitClientData, updateClientData } from "./client.services.js";



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



export const registerClient = async (
  request: ReqBodyRegisterClient,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const {
      name, logo_url, redirect_uris, allowed_grants,
      allowed_scopes, is_public,
    } = request.body;

    const result = await submitClientData({
      name,
      logoUrl: logo_url,
      redirectUris: redirect_uris,
      allowedGrants: allowed_grants,
      allowedScopes: allowed_scopes,
      isPublic: is_public,
    });
    if (!result) throw new AppError('Failed to register client', 500, ErrorCodes.internal.code);

    const { client, secret } = result;
    response.status(201).json({ client, secret, });
    return;
    
  } catch (error) {
    return next(error);
  }
}



export const updateClient = async (
  request: ReqGenericsUpdateClient,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = request.params;
    const {
      name, logo_url, redirect_uris_diff, allowed_grants_diff,
      allowed_scopes_diff, is_public_diff,
    } = request.body;

    const result = await updateClientData({
      id,
      name,
      logoUrl: logo_url,
      redirectUrisDiff: redirect_uris_diff,
      allowedGrantsDiff: allowed_grants_diff,
      allowedScopesDiff: allowed_scopes_diff,
      isPublicDiff: is_public_diff,
    });
    if (!result) throw new AppError('Failed to update client', 500, ErrorCodes.internal.code);

    const { client, secret, } = result;
    response.status(200).json({ client, secret, });
    return;
    
  } catch (error) {
    return next(error);
  }
}



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
