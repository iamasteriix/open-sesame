import type { Request, Response, NextFunction } from "express";
import type { Provider } from "oidc-provider";
import { ErrorCodes } from "@open-sesame/common";
import { AppError } from "../../lib/errors/errors.js";



/**
 * Reads the prompt name from `oidc-provider` and redirects to the relevant route
 * where the first-party auth flow and the provider's interactions are flattened into
 * a unified experience.
 */
export const makeDispatchInteraction = (oidcProvider: Provider) => {
  return async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      let details;
      try {
        details = await oidcProvider.interactionDetails(request, response);
      } catch (error) {
        throw error;
      }

      const { name } = details.prompt;

      switch (name) {
        case 'login':
          response.redirect('/auth/signin');
          return;
        case 'consent':
          response.redirect('/auth/allow');
          return;
        default:
          throw new AppError(`Unhandled prompt: ${name}`, 500, ErrorCodes.internal.code);
      }
    } catch (error) {
      return next(error);
    }
  }
}