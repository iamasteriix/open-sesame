import type { NextFunction, Response, } from "express";
import type { ReqGenericsSignin, } from "./types.js";
import { ValidationError } from "../../lib/errors/errors.js";
import { findUserByEmail, findUserByUsername, } from "../users/user.service.js";
import { sendMagicLink } from "../../lib/email/send-email.js";
import { issueEphemeralToken } from "./tokens.service.js";
import * as constants from "./constants.js";



export const submitSignin = async (
    request: ReqGenericsSignin,
    response: Response,
    next: NextFunction,
  ): Promise<void> => {
  try {
    const {
      identifier: { username, email },
    } = request.body;

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