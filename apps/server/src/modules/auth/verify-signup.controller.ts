import type { Response, NextFunction, } from "express";
import type { ReqQueryVerifySignup } from "./types.js";
import { ErrorCodes } from "@open-sesame/common";
import { AppError, UnauthorizedError, } from "../../lib/errors/errors.js";
import { consumeEphemeralToken, issueEphemeralToken } from "./tokens.service.js";
import { createUser } from "../users/user.service.js";
import * as constants from "./constants.js";



/**
 * Persists the cached user data to register the user then generates an MFA token to lock in
 * auth state until TOTP is enrolled.
 */
export const verifySignupMagicToken = async (
  request: ReqQueryVerifySignup,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {

    const { token, } = request.query;

    // verify magic token
    const userIdentifiersStr = await consumeEphemeralToken(constants.MAGIC_LINK_PREFIX, token);
    if (!userIdentifiersStr) throw new UnauthorizedError('Magic link is invalid or expired');

    // register user and persist TOTP secret credential
    const { username, email, secret, } = JSON.parse(userIdentifiersStr);
    const user = await createUser({
      username,
      email,
      role: 'user',
      credentialType: 'totp',
      credentialData: { secret, },
    });
    if (!user) throw new AppError(ErrorCodes.internal.message, 500, ErrorCodes.internal.code);

    // issue MFA token
    const mfaToken = await issueEphemeralToken(constants.MFA_TOKEN_PREFIX, user.id, constants.MFA_TOKEN_TTL_SECS);

    response.status(201).json({ mfa_token: mfaToken, });
    return;
        
  } catch (error) {
    return next(error);
  }
}