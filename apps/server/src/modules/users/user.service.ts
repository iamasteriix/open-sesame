import type { UserIdentifierOptions, UserOptions } from "./types.js";
import { dbPool } from "../../config/db.js";



export const createUser = async (input: UserIdentifierOptions): Promise<UserOptions> => {

  // naming prepared statement is probably fine here, stored procedure would be overkill
  const { rows } = await dbPool.query<UserOptions>({
    name: 'create-user',
    text: `
      insert
      into users (username, email, phone)
      values ($1, $2, $3)
      returning
        id, email, phone, username,
        display_name, role, deleted_at
    `,
    values: [
      input.username,
      input.email ?? null,
      input.phone ?? null,
    ],
  });

  return rows[0];
}



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



export const findUserByUsername = async (username: string): Promise<UserOptions> => {
  const { rows } = await dbPool.query<UserOptions>({
    name: 'find-user-by-username',
    text: `
      select
        id, email, phone, username,
        display_name, role, deleted_at
      from users
      where username = $1
        and deleted_at is null
    `,
    values: [username],
  });

  return rows[0] ?? null;
}



export const findUserById = async (userId: string): Promise<UserOptions> => {
  const { rows } = await dbPool.query<UserOptions>({
    name: 'find-user-by-id',
    text: `
      select
        id, email, phone, username,
        display_name, role, deleted_at
      from users
      where id = $1
        and deleted_at is null
    `,
    values: [userId],
  });

  return rows[0] ?? null;
}