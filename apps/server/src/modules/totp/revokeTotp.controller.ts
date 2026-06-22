import type { Response, NextFunction, } from "express";
import type { RequestBodyRevokeTotp } from "./types.js";
import { ValidationError } from "../../lib/errors/errors.js";
import { revokeTotpCredential } from "./revokeTotpCredential.js";


export const revokeTotp = async (
  request: RequestBodyRevokeTotp,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { userId } = request.body;
    if (!userId) throw new ValidationError('Missing required parameters');

    await revokeTotpCredential({ userId });

    response.status(200).json({ message: 'TOTP revoked successfully' });
    return;

  } catch (error) {
    return next(error);
  }
}