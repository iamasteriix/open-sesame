import type { Request } from "express";


export type ReqParamsGetInteraction = Request<{ uid: string }>;

export type ReqArgsTotpInteraction = Request<
  { uid: string },
  unknown,
  {
    email: string;
    code: string;
  }
>;




