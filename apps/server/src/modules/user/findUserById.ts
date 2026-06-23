import type { UserOptions } from "./types.js";
import { dbPool } from "../../config/db.js";


export const findUserById = async (userId: string): Promise<UserOptions> => {
  const { rows } = await dbPool.query<UserOptions>({
    name: 'find-user-by-id',
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