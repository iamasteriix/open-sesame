import type { KeyObject } from "jose";
import { importPKCS8, importSPKI, } from "jose";
import { env } from "./env.js";


let signingKey: KeyObject | null = null;
let verifyKey: KeyObject | null = null;


export const initKeys = async (): Promise<void> => {
  const privatePem = Buffer.from(env.JWT_PRIVATE_KEY_B64, 'base64').toString('utf-8');
  const publicPem = Buffer.from(env.JWT_PUBLIC_KEY_B64, 'base64').toString('utf-8');

  signingKey = await importPKCS8(privatePem, 'ES256');
  verifyKey = await importSPKI(publicPem, 'ES256');
}


export const getSigningKey = (): KeyObject => {
  if (!signingKey) throw new Error('Keys not initialized - call initKeys() first');
  return signingKey;
}


export const getVerifyKey = (): KeyObject => {
  if (!verifyKey) throw new Error('Keys not initialized - call initKeys() first');
  return verifyKey;
}