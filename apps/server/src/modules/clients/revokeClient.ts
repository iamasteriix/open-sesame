import type { RevokedClient } from "./types.js";
import { dbPool } from "../../config/db.js";
import { AppError } from "../../lib/errors/errors.js";


export const revokeClient = async (id: string): Promise<RevokedClient | undefined> => {
  
  let result;
  try {
    result = await dbPool.query({
      text: `
        select revoke_oauth_client ($1)
        as data
      `,
      values: [id],
    });
  } catch (error) {
    if (error instanceof AppError && error.code === 'P0002') throw new AppError(error.message, 404, error.code);
    throw error;
  }

  const row = result.rows[0]?.data;
  if (!row) return undefined;

  return row;
}