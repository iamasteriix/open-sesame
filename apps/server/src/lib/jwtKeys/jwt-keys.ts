import type { KeyObject } from "jose";
import { importPKCS8, importSPKI, } from "jose";
import { env } from "../../config/env.js";


let signingKey: KeyObject | null = null;
let verifyKey: KeyObject | null = null;


export const initJWTKeys = async (): Promise<void> => {
  const privatePem = Buffer.from(env.JWT_PRIVATE_KEY_B64, 'base64').toString('utf-8');
  const publicPem = Buffer.from(env.JWT_PUBLIC_KEY_B64, 'base64').toString('utf-8');

  // you need to set extractable to true here to allow the keys to be exported as jwks
  signingKey = await importPKCS8(privatePem, 'ES256', { extractable: true, });
  verifyKey = await importSPKI(publicPem, 'ES256', { extractable: true, });
}


export const getJWSigningKey = (): KeyObject => {
  if (!signingKey) throw new Error('Keys not initialized - call initJWTKeys() first');
  return signingKey;
}


export const getJWVerifyKey = (): KeyObject => {
  if (!verifyKey) throw new Error('Keys not initialized - call initJWTKeys() first');
  return verifyKey;
}