import type { Request, Response, NextFunction, } from "express";


export const signinController = (
  request: Request,
  response: Response,
  next: NextFunction,
): void => {
  response.status(200).json({ foo: 'Two is better than one, but I be skipping to three!' });
  return;
}