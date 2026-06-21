import type { UserOptions } from "./types.js";
import { dbPool } from "../../config/db.js";


export const findUserbyId = async (userId: string): Promise<UserOptions> => {
  const { rows } = await dbPool.query<UserOptions>({
      text: `
        select
          id, email, phone, username,
          display_name, role, deleted_at
        from users
        where id = $1
      `,
      values: [userId],
    });

  return rows[0] ?? null;
}