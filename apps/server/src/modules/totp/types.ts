import type { Request } from "express";


export type BuildTotpOptions = {
  uri: string;
  secret: string;
};

export type VerifyTotpOptions = {
  code: string;
  secret: string;
};

export type SaveTotpOptions = {
  userId: string;
  secret: string;
};

export type RevokeTotpOptions = {
  userId: string;
};

export type ReqBodyEnrollTotp = Request<{}, {}, {
  userId: string;
}>;

export type ReqBodyConfirmTotp = Request<{}, {}, {
  userId: string;
  code: string;
  secret: string;
}>;

export type ReqBodyVerifyTotp = Request<{}, {}, {
  userId: string;
  code: string;
}>;

export type ReqBodyRevokeTotp = Request<{}, {}, {
  userId: string;
}>;