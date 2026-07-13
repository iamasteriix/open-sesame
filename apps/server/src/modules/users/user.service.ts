import type { RegisterUserParams, UserOptions } from "./types.js";
import { execAsync } from "../../lib/postgres/client.js";
import { DatabaseError } from "pg";
import { AppError } from "../../lib/errors/errors.js";



export const createUser = async ({
  username,
  email,
  role,
  credentialType,
  credentialData,
}: RegisterUserParams): Promise<UserOptions> => {
  try {
    const data = await execAsync<{ data: UserOptions }>({
      statement: `select create_user ($p_username, $p_email, $p_role, $p_cred_type, $p_cred_data) as data`,
      params: {
        p_username: username,
        p_email: email,
        p_role: role,
        p_cred_type: credentialType,
        p_cred_data: JSON.stringify(credentialData),
      },
    });
    return data[0].data;

  } catch (error) {
    if (error instanceof DatabaseError) throw new AppError(error.message, 404, error.code);
    throw error;
  }
}



export const findUserByEmail = async (email: string): Promise<UserOptions | null> => {
  try {
    const data = await execAsync<UserOptions>({
      name: 'find-user-by-email',
      statement: `
        select u.id, u.email, u.phone, u.username, u.display_name, u.avatar_url, urr.roles
        from users u
        join lateral (
          select array_agg (r.slug order by r.slug) as roles
          from roles r
          join user_roles ur on ur.role_id = r.id
          where ur.user_id = u.id
          group by ur.user_id
        ) urr on true
        where u.email = $email and u.deleted_at is null
      `,
      params: { email, },
    });
    return data[0];

  } catch (error) {
    if (error instanceof DatabaseError) throw new AppError(error.message, 404, error.code);
    throw error;
  }
}



export const findUserByUsername = async (username: string): Promise<UserOptions> => {
  try {
    const data = await execAsync<UserOptions>({
      name: 'find-user-by-username',
      statement: `
        select u.id, u.email, u.phone, u.username, u.display_name, u.avatar_url, urr.roles
        from users u
        join lateral (
          select array_agg (r.slug order by r.slug) as roles
          from roles r
          join user_roles ur on ur.role_id = r.id
          where ur.user_id = u.id
          group by ur.user_id
        ) urr on true
        where u.username = $username and u.deleted_at is null
      `,
      params: { username, },
    });
    return data[0];

  } catch (error) {
    if (error instanceof DatabaseError) throw new AppError(error.message, 404, error.code);
    throw error;
  }
}



export const findUserById = async (userId: string): Promise<UserOptions> => {
  try {
    const data = await execAsync<UserOptions>({
      name: 'find-user-by-id',
      statement: `
        select u.id, u.email, u.phone, u.username, u.display_name, u.avatar_url, urr.roles
        from users u
        join lateral (
          select array_agg (r.slug order by r.slug) as roles
          from roles r
          join user_roles ur on ur.role_id = r.id
          where ur.user_id = u.id
          group by ur.user_id
        ) urr on true
        where u.id = $id and u.deleted_at is null
      `,
      params: { id: userId, },
    });
    return data[0];
    
  } catch (error) {
    if (error instanceof DatabaseError) throw new AppError(error.message, 404, error.code);
    throw error;
  }
}
