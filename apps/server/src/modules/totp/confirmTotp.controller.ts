import type { Response, NextFunction, } from "express";
import type { ReqBodyConfirmTotp } from "./types.js";
import { verifyTotpCode } from "./verifyTotpCode.js";
import { NotFoundError, UnauthorizedError, ValidationError } from "../../lib/errors/errors.js";
import { saveTotpCredential } from "./saveTotpCredential.js";
import { findUserByEmail } from "../user/finUserByEmail.js";


export const confirmTotp = async (
  request: ReqBodyConfirmTotp,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email, code, secret, } = request.body;
    if (!code || !secret || !email) throw new ValidationError('Missing required parameters');

    const user = await findUserByEmail(email);
    if (!user) throw new NotFoundError('User not found');
    
    const isValid = await verifyTotpCode({ code, secret, });
    if (!isValid) throw new UnauthorizedError('Invalid TOTP code');

    await saveTotpCredential({ userId: user.id, secret, });

    response.status(200).json({ message: 'TOTP enrolled successfully' });
    return;

  } catch (error) {
    return next(error);
  }
}