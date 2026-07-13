import type { TOTPSecretOptions } from "./types.js";
import { generateSecret, generateURI, verify } from "otplib";
import { DatabaseError } from "pg";
import { AppError } from "../../lib/errors/errors.js";
import { execAsync } from "../../lib/postgres/client.js";
import * as constants from "./constants.js";



/**
 * Generates a TOTP secret and uri and persists secret in redis.
 * The identifier is expected to be the user's email, username, etc
 * 
 * @returns uri string
 */
export const buildTotpUri = async (identifier: string): Promise<TOTPSecretOptions> => {
  const secret = generateSecret();
  const uri = generateURI({
    issuer: constants.TOTP_ISSUER,
    label: identifier,
    secret,
  });
  return { uri, secret, };
}


/**
 * Gets the ephemeral secret from redis to verify the OTP
 */
export const verifyTotpCode = async (
  code: string,
  secret: string
): Promise<boolean> => {
  const result = await verify({ secret, token: code, });
  return result.valid;
}



/**
 * Fetch OTP secret from storage
 */
export const getTotpSecret = async (userId: string): Promise<string | null> => {
  try {
    const rows = await execAsync({
      name: 'get-totp-secret',
      statement: `
        select data
        from user_credentials
        where user_id = $user_id and type = 'totp'
      `,
      params: { user_id: userId, },
    });
    return rows[0].data.secret;

  } catch (error) {
    if (error instanceof DatabaseError) throw new AppError(error.message, 500, error.code);
    throw error;
  }
}