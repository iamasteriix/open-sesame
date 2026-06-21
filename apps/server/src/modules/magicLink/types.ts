import type { Request } from "express";


export type MagicLinkParams = {
  email: string;
  token: string;
  endpoint: string;
};

export type RequestQueryMagicLink = Request<{}, {}, {}, {
  token: string;
}>

export type RequestBodyMagicLink = Request<{}, {}, {
  username: string;
  email: string;
}>