import type { RegisterUserParams, UserOptions } from "./types.js";
import { dbPool } from "../../config/db.js";



export const createUser = async (input: RegisterUserParams): Promise<UserOptions> => {
  const { rows, } = await dbPool.query({
    text: `select create_user ($1, $2, $3)`,
    values: [
      input.username,
      input.email,
      input.phone ?? null,
      input.secret,
    ],
  });
  return rows[0];
}



export const findUserByEmail = async (email: string): Promise<UserOptions | null> => {
  const { rows, } = await dbPool.query({
    text: `select find_user_by_email ($1)`,
    values: [email],
  });
  return rows[0];
}



export const findUserByUsername = async (username: string): Promise<UserOptions> => {
  const { rows, } = await dbPool.query({
    text: `select find_user_by_username ($1)`,
    values: [username],
  });
  return rows[0];
}



export const findUserById = async (userId: string): Promise<UserOptions> => {
  const { rows } = await dbPool.query({
    text: `select find_user_by_id ($1)`,
    values: [userId],
  });
  return rows[0];
}