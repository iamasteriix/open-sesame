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
  ownerId: string | null;
  redirectUris: string[];
  allowedGrants: string[] | null;
  allowedScopes: string[] | null;
  isPublic: boolean;
};

export type UpdateClientParams = {
  id: string;
  name: string;
  logoUrl: string | null;
  redirectUris: PatchStringArray;
  allowedGrants: PatchStringArray;
  allowedScopes: PatchStringArray;
  isPublic: PatchBool;
};

export type RegisteredClientOptions = {
  client_id: string;
  name: string;
  logo_url: string | null;
  owner_id: string | null;
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

export type RevokedClient = {
  id: string;
  revoked_at: string;
};

export type ReqBodyRegisterClient = Request<{}, {}, RegisterClientParams>;

export type ReqQueryGetClient = Request<{ id: string }>;

export type ReqUpdateClient = Request<
  { id: string },
  {},
  {
    name: string;
    logoUrl: string | null;
    redirectUris: PatchStringArray;
    allowedGrants: PatchStringArray;
    allowedScopes: PatchStringArray;
    isPublic: PatchBool;
  }
>;
