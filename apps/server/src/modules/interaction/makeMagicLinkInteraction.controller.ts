import type { Response, NextFunction } from "express";
import type { Provider } from "oidc-provider";
import type { ReqArgsMagicLinkInteraction } from "./types.js";
import { consumeMagicToken } from "../magicLink/consumeMagicToken.js";
import { UnauthorizedError } from "../../lib/errors/errors.js";


export const makeMagicLinkInteraction = (oidcProvider: Provider) => {
  return async (
    request: ReqArgsMagicLinkInteraction,
    response: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      
      const { token, } = request.body;

      const userId = await consumeMagicToken(token);
      if (!userId) throw new UnauthorizedError('Magic link is invalid or expired');
      
      await oidcProvider.interactionFinished(request, response, {
        login: { accountId: userId, },
      });
      return;

    } catch (error) {
      next(error);
    }
  }
}