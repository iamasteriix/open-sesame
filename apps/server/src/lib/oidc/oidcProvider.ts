import { Provider } from "oidc-provider";
import { exportJWK } from "jose";
import { getJWSigningKey } from "../jwtKeys/jwtKeys.js";
import { env } from "../../config/env.js";
import { OidcPostgresAdapter } from "./oidcPostgresAdapter.js";
import { logger } from "../../config/logger.js";


/**
 * @todo Wire `clients` to the `oauth_clients` table
 * @todo Tighten `pkce` per client
 */
export const createOidcProvider = async (): Promise<Provider> => {

  const signingKey = getJWSigningKey();
  const jwk = await exportJWK(signingKey);

  const provider = new Provider(env.ENDPOINT, {
    adapter: OidcPostgresAdapter,
    jwks: {
      keys: [jwk],
    },
    clients: [
      {
        client_id: 'dev-client',
        client_secret: 'hush',
        redirect_uris: ['http://localhost:5000/callback'],
        grant_types: ['authorization_code'],
        response_types: ['code'],
        id_token_signed_response_alg: 'ES256',
      }
    ],
    interactions: {
      url(_context, interaction) {
        return `/interaction/${interaction.uid}`;
      }
    },
    cookies: {
      keys: ['skibidi-dom-dom-dom-yes-yes-skibidi-dabudi'],
    },
    claims: {
      openid: ['sub'],
      email: ['email'],
      profile: ['username', 'display_name'],
    },
    scopes: ['openid', 'email', 'profile',],
    pkce: {
      required: () => false,
    },
    enabledJWA: {
      idTokenSigningAlgValues: ['ES256'],
    },
    features: {
      devInteractions: { enabled: false, },
    },
    findAccount: async (_, id) => {
      return {
        accountId: id,
        claims: async () => ({ sub: id, }),
      };
    }
  });

  // not having this cost me a egregious amount of time trying to find out why
  // the oidc provider kept breaking
  provider.on('server_error', (_, error) => {
    logger.error({ err: error }, 'Bruh');
  });

  return provider;
}