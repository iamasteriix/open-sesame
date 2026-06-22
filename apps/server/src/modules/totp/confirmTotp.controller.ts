import type { Response, NextFunction, } from "express";
import type { RequestBodyConfirmTotp } from "./types.js";
import { verifyTotpCode } from "./verifyTotpCode.js";
import { UnauthorizedError, ValidationError } from "../../lib/errors/errors.js";
import { saveTotpCredential } from "./saveTotpCredential.js";


export const confirmTotp = async (
  request: RequestBodyConfirmTotp,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { userId, code, secret, } = request.body;
    if (!code || !secret || !userId) throw new ValidationError('Missing required parameters');
    
    const isValid = await verifyTotpCode({ code, secret, });
    if (!isValid) throw new UnauthorizedError('Invalid TOTP code');

    await saveTotpCredential({ userId, secret, });

    response.status(200).json({ message: 'TOTP enrolled successfully' });
    return;

  } catch (error) {
    return next(error);
  }
}