import type { Request } from "express";
import type { Grant } from "oidc-provider";


export type ReqParamsGetInteraction = Request<{ uid: string }>;

export type ReqArgsTotpInteraction = Request<
  { uid: string },
  unknown,
  {
    email: string;
    code: string;
  }
>;

export type ReqArgsMagicLinkInteraction = Request<
  { uid: string },
  unknown,
  { token: string, }
>;

export type OidcGrantType = Grant | undefined;
export type OidcMissingScopesType = string[] | undefined;
