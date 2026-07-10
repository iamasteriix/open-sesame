import type { NextFunction, Request, Response, } from "express";
import type { Schema } from "yup";
import { ValidationError as YupValidationError } from "yup";
import { ValidationError } from "../../lib/errors/errors.js";



// partial to make the options, well, optional
type SchemaOptions = Partial<{
  params: Schema;
  body: Schema;
  query: Schema;
}>;


const GENERICS = ['params', 'body', 'query'] as const;  // `as const` so TypeScript knows exactly what strings are allowed



export const makeOnValidateRequests = (input: SchemaOptions) => {
  return async (
    request: Request,
    _: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      for (const generic of GENERICS) {
        const schema = input[generic];
        if (schema) await schema.validate(request[generic]);
      }
      return next();
    } catch (error: unknown) {
      if (error instanceof YupValidationError) return next(new ValidationError(error.message));
      return next(error);
    }
  }
}