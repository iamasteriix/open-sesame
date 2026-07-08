import type { Adapter, AdapterPayload, } from "oidc-provider";
import type { ChainableCommander } from "ioredis";
import { redis } from "../../config/redis.js";
import * as constants from "./constants.js";



/**
 * We use `multi` to wrap processes together and execute them at once an atomic transaction
 * to reduce network calls.
 * 
 * Data manipulation is managed by **RedisJSON** (the module behind `JSON.GET`/`JSON.SET`), standardized
 * on `$` JSONPath syntax. The chosen JSONPath syntax means that return data is wrapped in an array.
 * Why? Idk. I didn't look into it further.
 */
export class OidcRedisAdapter implements Adapter {
  private name: string;
  private multi: ChainableCommander = redis.multi();



  constructor (name: string) {
    this.name = name;
  }



  /**
   * Stores the payload as json data, then creates secondary pointers to map from `payload.userCode`
   * and `payload.uid` to the respective primary model `id` to accelerate lookups when values for
   * these fields are provided.
   * 
   * Also does kind of the same thing to with grants, but not really. With grants, the method indexes
   * by grouping all redis keys for models that have the same `payload.grantId`; then it dynamically
   * updates the index's TTL. This probably makes more sense when you consider it together with
   * `this.revokeByGrantId()`.
   * 
   * @param id 
   * @param payload 
   * @param expiresIn TTL in seconds
   */
  async upsert (
    id: string,
    payload: AdapterPayload,
    expiresIn: number | undefined,
  ): Promise<void> {
    const key = this.getKey(id);
    const payloadStr = JSON.stringify(payload);

    // primary data storage with expiry
    this.multi.call('JSON.SET', key, '$', payloadStr);
    if (expiresIn) this.multi.expire(key, expiresIn);

    // use distinguishing payload properties to map to model id
    if (payload.uid) this.setIndex(`${constants.UID_PREFIX}${payload.uid}`, id, expiresIn);
    if (payload.userCode) this.setIndex(`${constants.USERCODE_PREFIX}${payload.userCode}`, id, expiresIn);

    // group model ids by grant id to accelerate lookups
    // then dynamically update expiry
    if (constants.GRANTABLE_MODEL_NAMES.has(this.name) && payload.grantId) {
      const grantKey = `${constants.GRANT_PREFIX}${payload.grantId}`;
      this.multi.rpush(grantKey, key);
      const ttl = await redis.ttl(grantKey);
      if (expiresIn && expiresIn > ttl) this.multi.expire(grantKey, expiresIn);
    }

    // run
    await this.multi.exec();
  }



  async find (id: string): Promise<AdapterPayload | undefined> {
    const key = this.getKey(id);
    const data = await redis.call('JSON.GET', key) as string | null;  // i hate mid-function type assertions
    if (!data) return undefined;
    return JSON.parse(data);
  }



  async findByUid(uid: string): Promise<AdapterPayload | undefined> {
    const id = await redis.get(`${constants.UID_PREFIX}${uid}`);
    if (!id) return undefined;
    return this.find(id);
  }



  async findByUserCode (userCode: string): Promise<AdapterPayload | undefined> {
    const id = await redis.get(`${constants.USERCODE_PREFIX}${userCode}`);
    if (!id) return undefined;
    return this.find(id);
  }



  async consume (id: string): Promise<void> {
    const key = this.getKey(id);
    const now = Math.floor(Date.now() /1000);
    await redis.call('JSON.SET', key, '$.consumed', now);
  }



  /**
   * Finds all redis keys associated with the grant id and deletes them, along with their index
   */
  async revokeByGrantId (grantId: string): Promise<void> {
    const grantKey = `${constants.GRANT_PREFIX}${grantId}`;
    const keys = await redis.lrange(grantKey, 0, -1);
    keys.forEach(key => {
      this.multi.del(key);
    });
    this.multi.del(grantKey);
    await this.multi.exec();
  }



  async destroy (id: string): Promise<void> {
    const key = this.getKey(id);
    await redis.del(key);
  }



  private getKey (id: string): string {
    return `${this.name}:${id}`;
  }



  private setIndex (
    key: string,
    value: string,
    expiresIn: number | undefined,
  ): void {
    this.multi.set(key, value);
    if (expiresIn) this.multi.expire(key, expiresIn);
  }
}