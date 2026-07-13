import type { Response, NextFunction } from "express";
import type { ReqBodySignup } from "./types.js";
import { buildTotpUri } from "./totp.service.js";
import { issueEphemeralToken } from "./tokens.service.js";
import { sendMagicLink } from "../../lib/email/send-email.js";
import * as constants from "./constants.js";



export const handleSubmitSignup = async (
  request: ReqBodySignup,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    
    const { username, email, } = request.body;
    
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