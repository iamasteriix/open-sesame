import type { Response, NextFunction } from "express";
import type { RequestBodyEnrollTotp } from "./types.js";
import { NotFoundError, ValidationError } from "../../lib/errors/errors.js";
import { findUserById } from "../user/findUserById.js";
import { buildTotpUri } from "./buildTotpUri.js";


export const enrollTotp = async (
  request: RequestBodyEnrollTotp,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { userId } = request.body;
    if (!userId) throw new ValidationError('Missing required parameters');
  
    const user = await findUserById(userId);
    if (!user) throw new NotFoundError('User not found');
  
    const { uri, secret } = buildTotpUri(user.username);
  
    // secret is returned to the client temporarily - it is NOT persisted yet
    // persistence happens only after the user confirms a valid code in `/totp/confirm`
    response.status(200).json({ uri, secret, });
    return;
    
  } catch (error) {
    return next(error);
  }
}