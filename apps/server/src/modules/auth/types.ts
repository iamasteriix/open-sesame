import type { Request } from "express";
import type { Grant } from "oidc-provider";



type UserContacts =
  | { username: string; email?: never; }
  | { email: string; username?: never; }
  | { username: string; email: string; };

export type AccessTokenPayload = {
  subject: string;
  role: string;
};

export type RefreshTokenParams = {
  userId: string;
  newRefreshToken: string;
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
    identifier?: string;
    code?: string;
    mfaToken: string;
  },
  { token?: string, }
>;

export type ReqBodyConfirmTotp = Request<{}, {}, {
  label: string;
  code: string;
}>;