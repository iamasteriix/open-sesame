import type { Request } from "express";


type PatchBool = {
  incoming?: boolean;
  current?: boolean;
};

type PatchStringArray = {
  add?: string[];
  remove?: string[];
};

export type RegisterClientParams = {
  name: string;
  logoUrl: string | null;
  redirectUris: string[];
  allowedGrants: string[] | null;
  allowedScopes: string[] | null;
  isPublic: boolean;
};

export type UpdateClientParams = {
  id: string;
  name: string;
  logoUrl: string | null;
  redirectUrisDiff: PatchStringArray;
  allowedGrantsDiff: PatchStringArray;
  allowedScopesDiff: PatchStringArray;
  isPublicDiff: PatchBool;
};

export type RegisteredClientOptions = {
  client_id: string;
  name: string;
  logo_url: string | null;
  redirect_uris: string[];
  allowed_grants: string[];
  allowed_scopes: string[];
  created_at: string;
  updated_at: string;
};

export type RegisteredClientResult = {
  client: RegisteredClientOptions;
  secret?: string;
};

export type RevokedClientOptions = {
  id: string;
  revoked_at: string;
};

export type ReqBodyRegisterClient = Request<{}, {}, {
  name: string;
  logo_url: string | null;
  redirect_uris: string[];
  allowed_grants: string[] | null;
  allowed_scopes: string[] | null;
  is_public: boolean;
}>;

export type ReqQueryGetClient = Request<{ id: string }>;

export type ReqGenericsUpdateClient = Request<
  { id: string },
  {},
  {
    name: string;
    logo_url: string | null;
    redirect_uris_diff: PatchStringArray;
    allowed_grants_diff: PatchStringArray;
    allowed_scopes_diff: PatchStringArray;
    is_public_diff: PatchBool;
  }
>;
