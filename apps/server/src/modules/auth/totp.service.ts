import type { TOTPSecretOptions } from "./types.js";
import { generateSecret, generateURI, verify } from "otplib";
import { dbPool } from "../../config/db.js";
import { AppError } from "../../lib/errors/errors.js";
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
 * Saves a TOTP secret credential for a user through a database stored procedure.
 */
export const saveTotpCredential = async (
  userId: string,
  secret: string
): Promise<void> => {
  try {
    await dbPool.query({
      text: `select save_totp_credential($1, $2)`,
      values: [userId, secret],
    });
  } catch (error) {
    if (error instanceof AppError && error.code === '23505')
      throw new AppError(error.message, 400, error.code);
    else throw error;
  }
}



/**
 * Fetch OTP secret from storage
 */
export const getTotpSecret = async (userId: string): Promise<string | null> => {
  const { rows, rowCount } = await dbPool.query({
    name: 'get-totp-secret',
    text: `
      select data
      from credentials
      where user_id = $1 and type = 'totp'
    `,
    values: [userId],
  });
  if (!rowCount) return null;

  return rows[0].data.secret;
}



/**
 * Removes TOTP secret from the database
 */
export const revokeTotpCredential = async (userId: string): Promise<void> => {
  try {
    await dbPool.query({
      text: `select revoke_totp_credential($1)`,
      values: [userId],
    });
  } catch (error) {
    if (error instanceof AppError && error.code === '42703')
      throw new AppError(error.message, 404, error.code);
    else throw error;
  }
}