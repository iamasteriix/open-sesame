import type { Response, NextFunction } from "express";
import type { Provider } from "oidc-provider";
import type { ReqArgsTotpInteraction } from "./types.js";
import { findUserByEmailOrPhone } from "../user/finUserByEmailOrPhone.js";
import { NotFoundError, UnauthorizedError } from "../../lib/errors/errors.js";
import { getTotpSecret } from "../totp/getTotpSecret.js";
import { verifyTotpCode } from "../totp/verifyTotpCode.js";


export const makeTotpInteraction = (oidcProvider: Provider) => {
  return async (
    request: ReqArgsTotpInteraction,
    response: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      
      const { email, phone, code, } = request.body;

      const user = await findUserByEmailOrPhone({ email, phone, });
      if (!user) throw new NotFoundError('No such user');

      const secret = await getTotpSecret(user.id);
      if (!secret) throw new NotFoundError('TOTP not enrolled');

      const isValid = await verifyTotpCode({ code, secret, });
      if (!isValid) throw new UnauthorizedError('Invalid TOTP code');
      
      await oidcProvider.interactionFinished(request, response, {
        login: { accountId: user.id, },
      });
      return;

    } catch (error) {
      next(error);
    }
  }
}