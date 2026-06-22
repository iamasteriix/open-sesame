import type { RevokeTotpOptions } from "./types.js";
import { dbPool } from "../../config/db.js";
import { ValidationError } from "../../lib/errors/errors.js";


/**
 * Removes the TOTP credential for a user via database stored procedure.
 *
 * @param {RevokeTotpOptions} options - Options object.
 * @param {string} options.userId - User ID.
 * @returns {Promise<void>}
 * @throws {ValidationError} If user does not have TOTP enrolled.
 * @throws {Error} If database query fails.
 */
export const revokeTotpCredential = async ({ userId, }: RevokeTotpOptions): Promise<void> => {
  try {
    await dbPool.query({
      text: `select revoke_totp_credential($1)`,
      values: [userId],
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'totp_not_enrolled')
      throw new ValidationError('TOTP not enrolled for this user');
    else throw error;
  }
}