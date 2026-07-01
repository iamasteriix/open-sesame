import type { SaveTotpOptions } from "./types.js";
import { dbPool } from "../../config/db.js";
import { AppError } from "../../lib/errors/errors.js";


/**
 * Saves a TOTP secret credential for a user via database stored procedure.
 *
 * @param {SaveTotpOptions} options - Options object.
 * @returns {Promise<void>}
 * @throws {AppError} If user already has TOTP enrolled.
 * @throws {Error} If database query fails.
 */
export const saveTotpCredential = async ({ userId, secret, }: SaveTotpOptions): Promise<void> => {
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