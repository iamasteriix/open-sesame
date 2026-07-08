import type { Account, AccountClaims, Adapter, } from "oidc-provider";
import { Provider } from "oidc-provider";
import { exportJWK } from "jose";
import { getJWSigningKey } from "../jwtKeys/jwt-keys.js";
import { env } from "../../config/env.js";
import { OidcRedisAdapter } from "./redis-adapter.js";
import { OidcPostgresAdapter } from "./postgres-adapter.js";
import { logger } from "../../config/logger.js";
import { findUserById } from "../../modules/users/user.service.js";



export const createOidcProvider = async (): Promise<Provider> => {

  const signingKey = getJWSigningKey();
  const jwk = await exportJWK(signingKey);

  return new Provider (env.ENDPOINT, {
    // factory function that conditionally selects adapter instance depending on model name
    adapter: (name: string): Adapter => {
      if (['Client', 'Grant'].includes(name)) return new OidcPostgresAdapter(name);
      return new OidcRedisAdapter(name);
    },

    claims: {
      openid: ['sub'],
      email: ['email'],
      profile: ['username', 'display_name'],
    },

    clientDefaults: {
      id_token_signed_response_alg: 'ES256',
    },

    clientAuthMethods: ['client_secret_basic', 'none'],

    features: {
      devInteractions: { enabled: false, },
      clientCredentials: { enabled: true, },
    },

    interactions: {
      url(_, interaction) {
        return `/interaction/${interaction.uid}`;
      }
    },

    jwks: {
      keys: [jwk],
    },

    pkce: {
      // enforce pkce(tf?) for public clients (they have no client secret)
      // while letting confidential clients skip it
      required: (_, client) => client.clientAuthMethod === 'none',
    },

    ttl: {
      AccessToken: 15 *60,
      AuthorizationCode: 10 *60,
      Grant: 30 *24 *60 *60,
      IdToken: 15 *60,
      Interaction: 60 *60,
      RefreshToken: 30 *24 *60 *60,
      Session: 14 *24 *60 *60,
    },

    cookies: {
      keys: env.OIDC_COOKIE_KEYS.split(','),
      short: {
        sameSite: 'lax',
        path: '/',
      },
      long: {
        sameSite: 'lax',
        path: '/',
      },
    },

    // offline-access required to allow `refresh_token` grant for public clients
    scopes: ['openid', 'email', 'profile', 'offline_access'],

    renderError: (context, out, error) => {
      logger.error({
        err: error,
        path: `/oidc/${context.path}`,
      }, out.error_description);
    },

    findAccount: async (_, sub): Promise<Account | undefined> => {
      const user = await findUserById(sub);
      if (!user) return undefined;
      return {
        accountId: user.id,
        claims: async (_, scope) => {
          const claims: AccountClaims = { sub: user.id, };
          if (scope.includes('email')) claims.email = user.email;
          if (scope.includes('profile')) {
            claims.display_name = user.display_name;
          }
          return claims;
        },
      };
    },
    
    enabledJWA: {
      idTokenSigningAlgValues: ['ES256'],
    },
  });
}