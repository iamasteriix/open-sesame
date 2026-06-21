import type { SaveTotpOptions } from "./types.js";
import { dbPool } from "../../config/db.js";


export const saveTotpCredential = async ({ userId, secret, }: SaveTotpOptions): Promise<void> => {
  await dbPool.query({
    text: `select save_totp_credential($1, $2)`,
    values: [userId, secret],
  });
}