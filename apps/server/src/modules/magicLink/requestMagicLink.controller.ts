import type { Response, NextFunction } from "express";
import type { RequestBodyMagicLink } from "./types.js";
import { findUserByEmailOrPhone } from "../user/finUserByEmailOrPhone.js";
import { createUser } from "../user/createUser.js";
import { issueMagicToken } from "./issueMagicToken.js";
import { sendMagicLink } from "./sendMagicLink.js";
import { env } from "../../config/env.js";


/**
 * Express route handler that requests a magic link for passwordless authentication.
 * Always returns `202` regardless of whether the email exists to prevent leaking registered emails.
 *
 * @returns {Promise<void>}
 * @throws {Error} Passed to `next()` for centralized error handling via onError middleware.
 */
export const requestMagicLink = async (
  request: RequestBodyMagicLink,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { username, email } = request.body;
    
    let user = await findUserByEmailOrPhone({ email, });
    if (!user) user = await createUser({ username, email, });

    const token = await issueMagicToken(user.id);
    await sendMagicLink({
      email,
      token,
      endpoint: env.ENDPOINT,
    });

    response.status(202).json({ message: 'Magic link sent!' });

  } catch (error) {
    next(error);
  }
}