import type { NextFunction, Response, } from "express";
import type { ReqBodyRefreshToken } from "./types.js";
import { UnauthorizedError, ValidationError } from "../../lib/errors/errors.js";
import { rotateRefreshToken, signAccessToken } from "./tokens.service.js";
import * as constants from "./constants.js";



export const refreshTokenController = async (
  request: ReqBodyRefreshToken,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    
    const { refresh_token, } = request.body;
    if (!refresh_token) throw new ValidationError(constants.MISSING_PARAMS_MSG);

    const data = await rotateRefreshToken(refresh_token);
    if (!data) throw new UnauthorizedError('Refresh token is invalid or expired');

    const { userId, role, newRefreshToken, } = data;
    const accessToken = await signAccessToken(userId, role);

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