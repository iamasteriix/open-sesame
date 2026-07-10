import type { RegisterUserParams, UserOptions } from "./types.js";
import { execAsync } from "../../lib/postgres/client.js";



export const createUser = async ({
  handle,
  email,
  role,
  credentialType,
  credentialData,
}: RegisterUserParams): Promise<UserOptions> => {
  const data = await execAsync<UserOptions>({
    statement: `select create_user ($p_handle, $p_email, $p_role, $p_cred_type, $p_cred_data)`,
    params: {
      p_handle: handle,
      p_email: email,
      p_role: role,
      p_cred_type: credentialType,
      p_cred_data: JSON.stringify(credentialData),
    },
  });
  return data[0];
}



export const findUserByEmail = async (email: string): Promise<UserOptions | null> => {
  const data = await execAsync<UserOptions>({
    statement: `
      select id, email, phone, handle, display_name, avatar_url
      from users
      where email := $email and deleted_at is null
    `,
    params: { email, },
  });
  return data[0];
}



export const findUserByHandle = async (handle: string): Promise<UserOptions> => {
  const data = await execAsync<UserOptions>({
    statement: `
      select id, email, phone, handle, display_name, avatar_url
      from users
      where handle := $handle and deleted_at is null
    `,
    params: { handle, },
  });
  return data[0];
}



export const findUserById = async (userId: string): Promise<UserOptions> => {
  const data = await execAsync<UserOptions>({
    statement: `
      select id, email, phone, handle, display_name, avatar_url
      from users
      where id := $id and deleted_at is null
    `,
    params: { id: userId, },
  });
  return data[0];
}
