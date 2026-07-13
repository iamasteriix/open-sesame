import type { NextFunction, Response, } from "express";
import type { ReqBodyRefreshToken } from "./types.js";
import { UnauthorizedError, } from "../../lib/errors/errors.js";
import { revokeAccessToken, revokeEphemeralToken } from "./tokens.service.js";
import * as constants from "./constants.js";



export const signoutController = async (
  request: ReqBodyRefreshToken,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    
    const { refresh_token, } = request.body;

    const { authorization, } = request.headers;
    const accessToken = authorization?.startsWith('Bearer ') ? authorization.slice(7) : undefined;
    if (!accessToken) throw new UnauthorizedError('Missing or malformed access token');

    await revokeEphemeralToken(constants.REFRESH_TOKEN_PREFIX, refresh_token);
    await revokeAccessToken(accessToken);

    response.status(204).send();
    return;

  } catch (error) {
    return next(error);
  }
}