import type { NextFunction, Response, Request, } from "express";
import { verifyAccessToken } from "./tokens.service.js";
import { redis } from "../../config/redis.js";
import { UnauthorizedError } from "../../lib/errors/errors.js";
import * as constants from "./constants.js";



export const onVerifyAuth = async (
  request: Request,
  _: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    
    const { authorization } = request.headers;
    const accessToken = authorization?.startsWith('Bearer ') ? authorization.slice(7) : undefined;
    if (!accessToken) throw new UnauthorizedError('Missing or malformed access token');

    const { jti } = await verifyAccessToken(accessToken);

    const isBlacklisted = await redis.exists(`${constants.BLACKLIST_TOKEN_PREFIX}${jti}`);
    if (isBlacklisted) throw new UnauthorizedError('Token has been revoked');

    return next();

  } catch (error) {
    return next(error);
  }
}