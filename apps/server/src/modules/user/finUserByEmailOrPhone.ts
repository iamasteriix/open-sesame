import type { UserContactOptions, UserOptions } from "./types.js";
import { dbPool } from "../../config/db.js";


export const findUserByEmailOrPhone = async ({ email, phone, }: UserContactOptions): Promise<UserOptions | null> => {
  const { rows } = await dbPool.query<UserOptions>({
    text: `
      select
        id, email, phone, username,
        display_name, role, deleted_at
      from users
      where
        email = $1
        or phone = $2
        and deleted_at is null
    `,
    values: [email, phone],
  });

  return rows[0] ?? null;
}