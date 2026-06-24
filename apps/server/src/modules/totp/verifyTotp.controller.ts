import type { Response, NextFunction } from "express";
import type { ReqBodyVerifyTotp } from "./types.js";
import { signAccessToken } from "../tokens/signAccessToken.js";
import { issueRefreshToken } from "../tokens/issueRefreshToken.js";
import { findUserById } from "../user/findUserById.js";
import { NotFoundError, UnauthorizedError, ValidationError } from "../../lib/errors/errors.js";
import { getTotpSecret } from "./getTotpSecret.js";
import { verifyTotpCode } from "./verifyTotpCode.js";


export const verifyTotp = async (
  request: ReqBodyVerifyTotp,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { userId, code, } = request.body;
    if (!userId || !code) throw new ValidationError('Missing required paramaters');

    const user = await findUserById(userId);
    if (!user) throw new NotFoundError('User not found');

    const secret = await getTotpSecret(userId);
    if (!secret) throw new NotFoundError('TOTP not enrolled for this user');

    const isValid = await verifyTotpCode({ code, secret, });
    if (!isValid) throw new UnauthorizedError('Invalid TOTP code');

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