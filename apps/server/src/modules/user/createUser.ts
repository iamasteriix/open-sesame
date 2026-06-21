import type { CreateUserOptions, UserOptions } from "./types.js";
import { dbPool } from "../../config/db.js"


/**
 * Creates a new user with optional email and phone.
 * `input` defaults to `{}`so callers can create anonymous users with `createUser()` and no arguments.
 * Both columns default to `null` in the database, but being explicit in the query is clearer than relying
 * on columns defaults.
 *
 * @param {CreateUserOptions} [input={}] - User creation options containing optional email and phone.
 * @returns {Promise<UserOptions>} Created user with id, email, phone, username, display_name, role, and deleted_at.
 * @throws {Error} If database insert fails or violates constraints.
 */
export const createUser = async (
  input: CreateUserOptions = {}
): Promise<UserOptions> => {
  const { rows } = await dbPool.query<UserOptions>({
    text: `
      insert
      into users (email, phone)
      values ($1, $2)
      returning
        id, email, phone, username,
        display_name, role, deleted_at
    `,
    values: [
      input.email ?? null,
      input.phone ?? null,
    ],
  });

  return rows[0];
}