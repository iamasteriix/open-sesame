import type { Request, Response, NextFunction } from "express";


export const onValidateEmail = (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  // @todo validate email address
  next();
}