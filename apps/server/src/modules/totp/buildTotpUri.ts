import type { BuildTotpOptions } from "./types.js";
import { generateSecret, generateURI } from "otplib";
import { TOTP_ISSUER } from "./constants.js";


export const buildTotpUri = (username: string): BuildTotpOptions => {

  const secret = generateSecret();
  const uri = generateURI({
    issuer: TOTP_ISSUER,
    label: username,
    secret,
  });

  return { uri, secret, };
}