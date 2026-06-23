import { dbPool } from "../../config/db.js"


export const getTotpSecret = async (userId: string): Promise<string | null> => {
  const { rows } = await dbPool.query<{ data: { secret: string } }>({
    name: 'get-totp-secret',
    text: `
      select data
      from credentials
      where user_id = $1 and type = 'totp'
    `,
    values: [userId],
  });

  return rows[0]?.data.secret;
}