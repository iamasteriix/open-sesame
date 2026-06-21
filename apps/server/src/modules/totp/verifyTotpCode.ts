import type { VerifyTotpOptions } from "./types.js";
import { verify } from "otplib";


export const verifyTotpCode = async ({ code, secret, }: VerifyTotpOptions): Promise<boolean> => {
  const result = await verify({
    secret,
    token: code,
  });
  return result.valid;
}