import type { Response, NextFunction } from "express";
import type { Provider } from "oidc-provider";
import type { ReqGenericsVerifySignin, } from "./types.js";
import { NotFoundError, UnauthorizedError, ValidationError } from "../../lib/errors/errors.js";
import { consumeMagicToken, issueEphemeralToken, revokeEphemeralToken, signAccessToken } from "./tokens.service.js";
import { findUserByEmail, findUserById, findUserByUsername } from "../users/user.service.js";
import { validateEmailFormat } from "../../utils/helpers/validate-strings.helper.js";
import { getTotpSecret, verifyTotpCode } from "./totp.service.js";
import * as constants from "./constants.js";



/**
 * The default signin behavior right now is multi-factor, so this controller consumes
 * the magic token to verify the first step, and then issues a timed MFA token to
 * suspend the authentication flow until it is confirmed.
 */
export const verifyMagicToken = async (
    request: ReqGenericsVerifySignin,
    response: Response,
    next: NextFunction,
  ): Promise<void> => {
  try {
    
    const { token, } = request.query;
    if (!token) throw new ValidationError(constants.MISSING_PARAMS_MSG);

    // verify magic token
    const userId = await consumeMagicToken(token);
    if (!userId) throw new UnauthorizedError('Magic link is invalid or expired');

    const user = await findUserById(userId);
    if (!user) throw new NotFoundError('User not found');

    // issue MFA token
    const mfaToken = await issueEphemeralToken(constants.MFA_TOKEN_PREFIX, user.id, constants.MFA_TOKEN_TTL_SECS);
    
    response.status(202).json({ mfaToken, });
    return;

  } catch (error) {
    return next(error);
  }
}



/**
 * Open sesame!
 */
export const makeVerifyTotp = (oidcProvider: Provider) => {
  return async (
    request: ReqGenericsVerifySignin,
    response: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      
      const { identifier, code, mfaToken } = request.body;
      if (!identifier || !code) throw new ValidationError(constants.MISSING_PARAMS_MSG);
      
      let user;
      const isIdentifierEmail = validateEmailFormat(identifier);
      if (isIdentifierEmail) user = await findUserByEmail(identifier);
      else user = await findUserByUsername(identifier);
      if (!user) throw new NotFoundError('User not found');

      // retrieve secret from credentials
      const secret = await getTotpSecret(user.id);
      if (!secret) throw new UnauthorizedError();

      // validate OTP
      const isValid = await verifyTotpCode(code, secret);
      if (!isValid) throw new UnauthorizedError('Invalid TOTP code');
      else {
        // revoke mfa token
        const result = await revokeEphemeralToken(constants.MFA_TOKEN_PREFIX, mfaToken);
        if (!result) throw new UnauthorizedError();
      }

      // issue auth tokens
      const accessToken = await signAccessToken(user.id, user.role);
      const refreshToken = await issueEphemeralToken(constants.REFRESH_TOKEN_PREFIX, user.id, constants.REFRESH_TOKEN_TTL_SECS);

      response.status(200).json({
        refresh_token: refreshToken,
        access_token: accessToken,
        token_type: 'Bearer',
        expires_in: constants.ACCESS_TOKEN_TTL_SECS,
      });

      // continue with oidc
      const oidcDetails = await oidcProvider.interactionDetails(request, response);
      if (oidcDetails !instanceof Error) {   
        await oidcProvider.interactionFinished(request, response, {
          login: { accountId: user.id, },
        });
      }
      return;

    } catch (error) {
      return next(error);
    }
  }
}