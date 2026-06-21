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

export type RequestBodyEnrollTotp = Request<{}, {}, {
  userId: string;
}>;

export type RequestBodyConfirmTotp = Request<{}, {}, {
  userId: string;
  code: string;
  secret: string;
}>;

export type RequestBodyVerifyTotp = Request<{}, {}, {
  userId: string;
  code: string;
}>;