import type { Request } from "express";
import type { Grant } from "oidc-provider";



type UserContacts =
  | { username: string; email?: never; }
  | { email: string; username?: never; }
  | { username: string; email: string; };

export type AccessTokenPayload = {
  sub: string;
  role: string;
  jti: string;
};

export type RefreshTokenParams = {
  userId: string;
  role: string;
  newRefreshToken: string;
};

export type TOTPSecretOptions = {
  uri: string;
  secret: string;
};

export type OidcGrantType = Grant | undefined;

export type OidcMissingScopesType = string[] | undefined;

export type RedisPipelineExecType = [
  [Error | null, string | null],
  [Error | null, number],
];

export type ReqGenericsSignin = Request<
  {},
  {},
  UserContacts,
  { next?: string; }
>;

export type ReqGenericsVerifySignin = Request<
  { uid: string },
  unknown,
  {
    code?: string;
    mfaToken: string;
  },
  { token?: string, }
>;

export type ReqBodyConfirmTotp = Request<{}, {}, {
  label: string;
  code: string;
}>;

export type ReqGenericsSignup = Request<
  {},
  {},
  {
    username: string;
    email: string;
  },
  { next?: string; }
>;

export type ReqGenericsVerifySignup = Request<
  { uid: string },
  unknown,
  {
    email?: string;
    code?: string;
    mfaToken?: string;
  },
  { token?: string, }
>;

export type ReqBodyRefreshToken = Request<{}, {}, { refresh_token: string; }>;