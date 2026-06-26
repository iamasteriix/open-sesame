import type { Request, Response, NextFunction } from "express";
import type { Provider } from "oidc-provider";


export const getInteractionDetails = (oidcProvider: Provider) => {
  return async (
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> => {
    try {

      const details = await oidcProvider.interactionDetails(request, response);
      response.status(200).json(details);

    } catch (error) {
      next(error);
    }
  }
}