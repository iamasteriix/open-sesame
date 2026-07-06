import type { Response, NextFunction } from "express";
import type { ReqGenericsSignup } from "./types.js";
import { ValidationError } from "../../lib/errors/errors.js";
import { buildTotpUri } from "./totp.service.js";
import { issueEphemeralToken } from "./tokens.service.js";
import { sendMagicLink } from "../../lib/email/send-email.js";
import * as constants from "./constants.js";



export const handleGetSignup = async (
  request: any,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    
    response.status(200).json({ foo: 'bar', });
    return;

  } catch (error) {
    return next(error);
  }
}



export const handleSubmitSignup = async (
  request: ReqGenericsSignup,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    
    const { username, email, } = request.body;
    if (!username || !email) throw new ValidationError(constants.MISSING_PARAMS_MSG);
    
    const { uri, secret, } = await buildTotpUri(username); // build totp scheme

    // issue magic link
    const userIdentifiersStr = JSON.stringify({ username, email, secret, });
    const token = await issueEphemeralToken(constants.MAGIC_LINK_PREFIX, userIdentifiersStr, constants.MAGIC_LINK_TTL_SECS);
    await sendMagicLink(email, token);

    // done
    response.status(202).json({
      uri,
      message: 'Magic link sent!'
    });
    return;

  } catch (error) {
    return next(error);
  }
}