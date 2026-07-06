import type { Response, NextFunction, } from "express";
import type { ReqGenericsVerifySignup } from "./types.js";
import { ErrorCodes } from "@open-sesame/common";
import { AppError, UnauthorizedError, ValidationError } from "../../lib/errors/errors.js";
import { consumeEphemeralToken, issueEphemeralToken } from "./tokens.service.js";
import { createUser } from "../users/user.service.js";
import * as constants from "./constants.js";



/**
 * Persists the cached user data to register the user then generates an MFA token to lock in
 * auth state until TOTP is enrolled.
 */
export const verifySignupMagicToken = async (
  request: ReqGenericsVerifySignup,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {

    const { token, } = request.query;
    if (!token) throw new ValidationError(constants.MISSING_PARAMS_MSG);

    // verify magic token
    const userIdentifiersStr = await consumeEphemeralToken(constants.MAGIC_LINK_PREFIX, token);
    if (!userIdentifiersStr) throw new UnauthorizedError('Magic link is invalid or expired');

    // register user and persist TOTP secret credential
    const { username, email, secret, } = JSON.parse(userIdentifiersStr);
    const user = await createUser({ username, email, secret, });
    if (!user) throw new AppError(ErrorCodes.internal.message, 500, ErrorCodes.internal.code);

    // issue MFA token
    const mfaToken = await issueEphemeralToken(constants.MFA_TOKEN_PREFIX, user.id, constants.MFA_TOKEN_TTL_SECS);

    response.status(201).json({ mfaToken, });
    return;
        
  } catch (error) {
    return next(error);
  }
}