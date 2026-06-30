import type { Adapter, AdapterPayload } from "oidc-provider";
import { dbPool } from "../../config/db.js";


export class OidcPostgresAdapter implements Adapter {
  private type: string;

  constructor (type: string) {
    this.type = type;
  }


  async upsert (
    id: string,
    payload: AdapterPayload,
    expiresIn: number,
  ): Promise<void> {

    const grantedAt = payload?.grantedAt ? Number(payload.grantedAt) : undefined;
    const grantedAtInMs = grantedAt ? new Date(grantedAt *1000) : null;
    const expiresAtInMs = expiresIn ? new Date(Date.now() + (expiresIn *1000)) : null;

    await dbPool.query({
      name: 'upsert-oidc-model',
      text: `
        insert into oidc_models (id, type, payload, granted_at, expires_at)
        values ($1, $2, $3, $4, $5)
        on conflict on constraint oidc_models_pkey do update
          set payload = excluded.payload,
            granted_at = excluded.granted_at,
            expires_at = excluded.expires_at
      `,
      values: [
        id,
        this.type,
        JSON.stringify(payload),
        grantedAtInMs,
        expiresAtInMs
      ],
    });
  }


  // branch between models
  async find (id: string): Promise<AdapterPayload | undefined> {
    if (this.type === 'Client') return this.findClientModel(id);
    return this.findModel(id);
  }


  // marks one-time-use models like authorization codes so the provider can detect subsequent attempts
  async consume (id: string): Promise<void> {
    await dbPool.query({
      name: 'mark-oidc-model-consumed',
      text: `
        update oidc_models
        set consumed_at = now()
        where id = $1 and type = $2
      `,
      values: [id, this.type],
    });
  }


  async destroy (id: string): Promise<void> {
    await dbPool.query({
      name: 'remove-oidc-model',
      text: `
        delete
        from oidc_models
        where id = $1 and type = $2
      `,
      values: [id, this.type],
    });
  }


  /**
   * Cleans up all models for a given grant given its id.
   * Used, for example, when a user signs out or revokes consent.
   * Doesn't require `this.type` because it deletes every single record associated with the grant id.
   */
  async revokeByGrantId (grantId: string): Promise<void> {
    await dbPool.query({
      name: 'revoke-oidc-model-by-grant-id',
      text: `
        delete
        from oidc_models
        where payload->>'grantId' = $1
      `,
      values: [grantId],
    });
  }


  async findByUserCode (userCode: string): Promise<AdapterPayload | undefined> {
    const { rows, rowCount, } = await dbPool.query({
      name: 'find-oidc-model-by-user-code',
      text: `
        select payload, consumed_at
        from oidc_models
        where payload->>'userCode' = $1
          and type = $2
          and (expires_at is null or expires_at > now())
      `,
      values: [userCode, this.type],
    });
    if (!rowCount) return undefined;

    const { payload, consumed_at, } = rows[0];
    const consumed = consumed_at ? Math.floor(new Date(consumed_at).getTime() /1000) : undefined; // oidc provider expects consumed time as a unix timestamp inside the payload

    return { ...payload, consumed, };
  }


  async findByUid (uid: string): Promise<AdapterPayload | undefined> {
    const { rows, rowCount, } = await dbPool.query({
      name: 'find-oidc-model-by-uid',
      text: `
        select payload, consumed_at
        from oidc_models
        where payload->>'uid' = $1
          and type = $2
          and (expires_at is null or expires_at > now())
      `,
      values: [uid, this.type],
    });
    if (!rowCount) return undefined;

    const { payload, consumed_at, } = rows[0];
    const consumed = consumed_at ? Math.floor(new Date(consumed_at).getTime() /1000) : undefined;

    return { ...payload, consumed, };
  }


  /**
   * Since the adapter is polymorphic, this isolated method is the first example I had to
   * branch out of `this.find()` to handle specifically fetching the 'Client' model, separate
   * from all the other generic models.
   * The OIDC provider performs a direct comparison between `client.clientSecret` on the client instance
   * and `client_secret` included in the payload returned by this method to verify them. As it turns
   * out, it is recommended (weasel talk) that confidential clients authenticate with other methods
   * besides `'none'` for enhanced security. As it turns out, these other methods require that `client_secret`
   * be populated, otherwise the provider will throw an error.
   * 
   * @see onVerifyClient for how we ensure that this trivial confirmation by the provider that requires *some*
   * secret to exist in both the client instance and the payload required by this instance is effected.
   * 
   * @author iamasteriix
   */
  private async findClientModel (id: string): Promise<AdapterPayload | undefined> {
    const { rows, rowCount } = await dbPool.query({
      name: 'find-oauth-client',
      text: `
        select
          client_id, client_secret_hash,
          redirect_uris,
          allowed_grants, allowed_scopes,
          is_public
        from oauth_clients
        where client_id = $1
          and revoked_at is null
      `,
      values: [id],
    });
    if (!rowCount) return undefined;

    return {
      client_id: rows[0].client_id,
      client_secret: rows[0].client_secret_hash,  // required by provider for confidential clients' auth confirmation
      redirect_uris: rows[0].redirect_uris,
      grant_types: rows[0].allowed_grants,
      scope: rows[0].allowed_scopes.join(' '),
      token_endpoint_auth_method: rows[0].is_public ? 'none' : 'client_secret_basic',
    };
  }


  // query every model that is not 'Client'
  private async findModel (id: string): Promise<AdapterPayload | undefined> {
    const { rows, rowCount, } = await dbPool.query({
      name: 'find-oidc-model',
      text: `
        select payload, consumed_at
        from oidc_models
        where id = $1
          and type = $2
          and (expires_at is null or expires_at > now())
      `,
      values: [id, this.type],
    });
    if (!rowCount) return undefined;

    const { payload, consumed_at, } = rows[0];
    const consumed = consumed_at ? Math.floor(new Date(consumed_at).getTime() /1000) : undefined;

    return { ...payload, consumed, };
  }
}