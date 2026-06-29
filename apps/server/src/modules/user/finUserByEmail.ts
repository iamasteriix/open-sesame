import type { UserOptions } from "./types.js";
import { dbPool } from "../../config/db.js";


export const findUserByEmail = async (email: string): Promise<UserOptions | null> => {
  const { rows } = await dbPool.query<UserOptions>({
    name: 'find-user-by-email',
    text: `
      select
        id, email, phone, username,
        display_name, role, deleted_at
      from users
      where email = $1
        and deleted_at is null
    `,
    values: [email],
  });

  return rows[0] ?? null;
}