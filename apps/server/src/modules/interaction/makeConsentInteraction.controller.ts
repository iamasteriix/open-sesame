import type { Request, Response, NextFunction, } from "express";
import type { Provider } from "oidc-provider";
import type { OidcGrantType, OidcMissingScopesType } from "./types.js";
import { UnauthorizedError } from "../../lib/errors/errors.js";


/**
 * When a user has already approved scopes for a client in a previous session, the oidc provider
 * stores that as a `Grant` and associates its id with the session. Subsequent authorizations
 * fetch this grant and can consent to adding new scopes or resume the existing grant.
 * If the user and client don't have an existing relationship, the provider creates a fresh grant
 * from scratch from the client's scopes for the user to approve.
 */
export const makeConsentInteraction = (oidcProvider: Provider) => {
  return async (
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {

      const { grantId, session, params, prompt, } = await oidcProvider.interactionDetails(request, response);
      if (!session) throw new UnauthorizedError('Session might have expired');

      let grant: OidcGrantType;
      if (grantId) grant = await oidcProvider.Grant.find(grantId);
      else {
        grant = new oidcProvider.Grant({
          accountId: session.accountId,
          clientId: String(params.client_id),
        });
      }

      const missingScopes = prompt.details.missingOIDCScope as OidcMissingScopesType;
      if (missingScopes) grant?.addOIDCScope(missingScopes.join(' '));

      const currentGrantId = await grant?.save();
      await oidcProvider.interactionFinished(request, response, {
        consent: { grantId: currentGrantId, },
      });
      return;
      
    } catch (error) {
      return next(error);
    }
  }
}