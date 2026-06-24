import type { Response, NextFunction } from "express";
import type { ReqQueryMagicLink } from "./types.js";
import { findUserById } from "../user/findUserById.js";
import { consumeMagicToken } from "./consumeMagicToken.js";
import { NotFoundError, UnauthorizedError } from "../../lib/errors/errors.js";
import { signAccessToken } from "../tokens/signAccessToken.js";
import { issueRefreshToken } from "../tokens/issueRefreshToken.js";


export const verifyMagicLink = async (
  request: ReqQueryMagicLink,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { token } = request.query;

    const userId = await consumeMagicToken(token);
    if (!userId) throw new UnauthorizedError('Magic link is invalid or expired');

    const user = await findUserById(userId);
    if (!user) throw new NotFoundError('User not found');

    const accessToken = await signAccessToken({
      subject: user.id,
      role: user.role,
    });
    const refreshToken = await issueRefreshToken(user.id);

    response.status(200).json({ accessToken, refreshToken, });
    return;

  } catch (error) {
    return next(error);
  }
}