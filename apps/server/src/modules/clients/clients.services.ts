import type { RegisteredClientOptions } from "./types.js";
import { dbPool } from "../../config/db.js";



export const findClientById = async (id: string): Promise<RegisteredClientOptions | undefined> => {

  const { rows, rowCount } = await dbPool.query<RegisteredClientOptions>({
    name: 'find-client-by-id',
    text: `
      select
        client_id,
        name, logo_url,
        redirect_uris,
        allowed_grants, allowed_scopes,
        created_at, updated_at
      from oauth_clients
      where id = $1
        and revoked_at is null
    `,
    values: [id],
  });
  if (!rowCount) return undefined;

  return rows[0];
}



export const registerClient = async (foobar: any) => {
  return { client: foobar.body, secret: 'bar', }
}
