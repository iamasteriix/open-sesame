import type { NextFunction, Response, } from "express";
import type { ReqBodyRefreshToken } from "./types.js";
import { UnauthorizedError, } from "../../lib/errors/errors.js";
import { rotateRefreshToken, signAccessToken } from "./tokens.service.js";
import * as constants from "./constants.js";



export const refreshTokenController = async (
  request: ReqBodyRefreshToken,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    
    const { refresh_token, } = request.body;

    const data = await rotateRefreshToken(refresh_token);
    if (!data) throw new UnauthorizedError('Refresh token is invalid or expired');

    const { userId, roles, newRefreshToken, } = data;
    const accessToken = await signAccessToken(userId, roles);

    response.status(200).json({
      refresh_token: newRefreshToken,
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: constants.ACCESS_TOKEN_TTL_SECS,
    });

  } catch (error) {
    return next(error);
  }
}