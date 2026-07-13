import type { NextFunction, Response, Request, } from "express";
import { verifyAccessToken } from "./tokens.service.js";
import { UnauthorizedError } from "../../lib/errors/errors.js";



/**
 * @todo Probably use this to redirect authenticated users
 */
export const onVerifyAuth = async (
  request: Request,
  _: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    
    const { authorization } = request.headers;
    const accessToken = authorization?.startsWith('Bearer ') ? authorization.slice(7) : undefined;
    if (!accessToken) throw new UnauthorizedError('Missing or malformed access token');

    await verifyAccessToken(accessToken);
    return next();

  } catch (error) {
    return next(error);
  }
}
