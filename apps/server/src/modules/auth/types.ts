import type { Request } from "express";
import type { Grant } from "oidc-provider";
import type { UserRoles } from "../users/types.js";



type UserContacts =
  | { username: string; email?: never; }
  | { email: string; username?: never; }
  | { username: string; email: string; };


export type AccessTokenPayload = {
  sub: string;
  roles: UserRoles[];
  jti: string;
};


export type RefreshTokenParams = {
  userId: string;
  roles: UserRoles[];
  newRefreshToken: string;
};


export type TOTPSecretOptions = {
  uri: string;
  secret: string;
};


export type OidcGrantType = Grant | undefined;


export type OidcMissingScopesType = string[] | undefined;


export type ReqGenericsSignin = Request<
  {},
  {},
  { identifier: UserContacts; },
  { next?: string; }
>;


export type ReqQueryVerifySignin = Request<{}, {}, {}, { token: string; }>;


export type ReqBodyVerifySignin = Request<{}, {}, {
    code: string;
    mfa_token: string;
  }
>;


export type ReqBodyConfirmTotp = Request<{}, {}, {
  label: string;
  code: string;
}>;


export type ReqBodySignup = Request<{}, {}, {
    username: string;
    email: string;
  }
>;


export type ReqQueryVerifySignup = Request<{}, {}, {}, { token: string; }>;


export type ReqBodyRefreshToken = Request<{}, {}, { refresh_token: string; }>;