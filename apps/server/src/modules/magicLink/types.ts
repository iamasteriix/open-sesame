import type { Request } from "express";


export type MagicLinkParams = {
  email: string;
  token: string;
  endpoint: string;
};

export type ReqQueryMagicLink = Request<{}, {}, {}, {
  token: string;
}>

export type ReqBodyMagicLink = Request<{}, {}, {
  username: string;
  email: string;
}>