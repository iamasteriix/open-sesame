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
    jwks: {
      keys: [jwk],
    },
    interactions: {
      url(_, interaction) {
        return `/interaction/${interaction.uid}`;
      }
    },
    cookies: {
      keys: env.OIDC_COOKIE_KEYS.split(','),
      short: {
        sameSite: 'lax',
        secure: env.NODE_ENV === 'production',
      },
      long: {
        sameSite: 'lax',
        secure: env.NODE_ENV === 'production',
      },
    },
    claims: {
      openid: ['sub'],
      email: ['email'],
      profile: ['username', 'display_name'],
    },
    scopes: ['openid', 'email', 'profile',],
    pkce: {
      required: (_, client) => client.clientAuthMethod === 'none',  // expose public clients at runtime
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
    },
    ttl: {
      AccessToken: 15 *60,
      AuthorizationCode: 10 *60,
      Grant: 30 *24 *60 *60,
      IdToken: 15 *60,
      Interaction: 60 *60,
      RefreshToken: 14 *24 *60 *60,
      Session: 14 *24 *60 *60,
    },
  });
}