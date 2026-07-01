import { Provider } from "oidc-provider";
import { exportJWK } from "jose";
import { getJWSigningKey } from "../jwtKeys/jwtKeys.js";
import { env } from "../../config/env.js";
import { OidcPostgresAdapter } from "./oidcPostgresAdapter.js";


/**
 * @todo Tighten `pkce` per client
 */
export const createOidcProvider = async (): Promise<Provider> => {

  const signingKey = getJWSigningKey();
  const jwk = await exportJWK(signingKey);

  return new Provider(env.ENDPOINT, {
    adapter: OidcPostgresAdapter,
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
      short: { sameSite: 'lax', },
      long: { sameSite: 'lax', },
    },
    scopes: ['openid', 'email', 'profile',],
    findAccount: async (_, id) => {
      return {
        accountId: id,
        claims: async () => ({ sub: id, }),
      };
    },
    enabledJWA: {
      idTokenSigningAlgValues: ['ES256'],
    },
  });
}