import type { NextFunction, Response, } from "express";
import type { Provider } from "oidc-provider";
import type { ReqGenericsSignin, } from "./types.js";
import { ValidationError } from "../../lib/errors/errors.js";
import { findUserByEmail, findUserByUsername, } from "../users/user.service.js";
import { sendMagicLink } from "../../lib/email/send-email.js";
import { issueEphemeralToken } from "./tokens.service.js";
import * as constants from "./constants.js";



export const makeGetSigninDetails = (oidcProvider: Provider) => {
  return async (
    request: any,
    response: Response,
    next: NextFunction,
  ) => {
    try {
      let details;
      try {
        details = await oidcProvider.interactionDetails(request, response);
      } catch (error) {
        console.log(error);
      }
      
      response.status(200).json(request.cookies);
      return;

    } catch (error) {
      return next(error);
    }
  }
}



export const submitSignin = async (
    request: ReqGenericsSignin,
    response: Response,
    next: NextFunction,
  ): Promise<void> => {
  try {
    const { username, email, } = request.body;
    if (!username && !email) throw new ValidationError(constants.MISSING_PARAMS_MSG);

    // find user
    let user;
    if (email) user = await findUserByEmail(email);
    else if (username) user = await findUserByUsername(username);
    if (!user) throw new ValidationError('User not found');
    
    // issue magic link
    const token = await issueEphemeralToken(constants.MAGIC_LINK_PREFIX, user.id, constants.MAGIC_LINK_TTL_SECS);
    await sendMagicLink(user.email, token);
    
    response.status(202).json({ message: 'Magic link sent!' });
    return;
    
  } catch (error) {
    return next(error);
  }
}