import type { UserIdentifierOptions, UserOptions } from "./types.js";
import { dbPool } from "../../config/db.js"


/**
 * Creates a new user with a required username and optional email and phone.
 *
 * @param {CreateUserOptions} input - User creation options containing username and optional email and phone.
 * @returns {Promise<UserOptions>} Created user with id, email, phone, username, display_name, role, and deleted_at.
 * @throws {Error} If database insert fails or violates constraints.
 */
export const createUser = async (input: UserIdentifierOptions): Promise<UserOptions> => {

  // naming prepared statement is probably fine here
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