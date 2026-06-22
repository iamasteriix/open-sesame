import type { Request, Response, NextFunction } from "express";
import { ValidationError } from "../../lib/errors/errors.js";
import emailValidator from "node-email-verifier";


type RequestBodyValidateEmail = Request<{}, {}, { email: string }>;


export const onValidateEmail = async (
  request: RequestBodyValidateEmail,
  _response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email } = request.body;
    if (!email) throw new ValidationError('Missing required parameters');

    const isValid = await emailValidator(email, {
      checkMx: true,
      checkDisposable: true,
      timeout: 7000,
    });
    if (!isValid) throw new ValidationError('Invalid email address');
    
    return next();

  } catch (error) {
    return next(error);
  }
}