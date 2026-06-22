import type { SaveTotpOptions } from "./types.js";
import { dbPool } from "../../config/db.js";
import { ValidationError } from "../../lib/errors/errors.js";


/**
 * Saves a TOTP secret credential for a user via database stored procedure.
 *
 * @param {SaveTotpOptions} options - Options object.
 * @param {string} options.userId - User ID.
 * @param {string} options.secret - TOTP secret key.
 * @returns {Promise<void>}
 * @throws {ValidationError} If user already has TOTP enrolled.
 * @throws {Error} If database query fails.
 */
export const saveTotpCredential = async ({ userId, secret, }: SaveTotpOptions): Promise<void> => {
  try {
    await dbPool.query({
      text: `select save_totp_credential($1, $2)`,
      values: [userId, secret],
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'totp_already_enrolled')
      throw new ValidationError('TOTP already enrolled for this user');
    else throw error;
  }
}