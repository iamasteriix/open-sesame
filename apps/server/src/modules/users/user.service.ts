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
    name: 'find-user-by-email',
    statement: `
      select u.id, u.email, u.phone, u.handle, u.display_name, u.avatar_url, urr.roles
      from users u
      join lateral (
        select array_agg (r.slug order by r.slug) as roles
        from roles r
        join users_roles ur on ur.role_id = r.id
        where ur.user_id = u.id
        group by ur.user_id
      ) urr on true
      where u.email := $email and u.deleted_at is null
    `,
    params: { email, },
  });
  return data[0];
}



export const findUserByHandle = async (handle: string): Promise<UserOptions> => {
  const data = await execAsync<UserOptions>({
    name: 'find-user-by-handle',
    statement: `
      select u.id, u.email, u.phone, u.handle, u.display_name, u.avatar_url, urr.roles
      from users u
      join lateral (
        select array_agg (r.slug order by r.slug) as roles
        from roles r
        join users_roles ur on ur.role_id = r.id
        where ur.user_id = u.id
        group by ur.user_id
      ) urr on true
      where u.handle := $handle and u.deleted_at is null
    `,
    params: { handle, },
  });
  return data[0];
}



export const findUserById = async (userId: string): Promise<UserOptions> => {
  const data = await execAsync<UserOptions>({
    name: 'find-user-by-id',
    statement: `
      select u.id, u.email, u.phone, u.handle, u.display_name, u.avatar_url, urr.roles
      from users u
      join lateral (
        select array_agg (r.slug order by r.slug) as roles
        from roles r
        join users_roles ur on ur.role_id = r.id
        where ur.user_id = u.id
        group by ur.user_id
      ) urr on true
      where u.id := $id and u.deleted_at is null
    `,
    params: { id: userId, },
  });
  return data[0];
}
