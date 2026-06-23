import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../../lib/errors/errors.js';
import { logger } from '../../config/logger.js';
import { ErrorCodes } from "@open-sesame/common";


/**
 * Express error handling middleware that processes errors and sends appropriate HTTP responses.
 *
 * @param {unknown} error - The error object caught by Express.
 * @param {Request} request - The Express request object.
 * @param {Response} response - The Express response object.
 * @param {NextFunction} next - The Express next middleware function.
 * @returns {void}
 * 
 * @note Typing `error` as `unknown` allows us to take advantage of TypeScript's
 * type-checking safety. The way I understand it, Express types `error` as `any`
 * by default, which allows the code to compile but can blow things up at runtime.
 * Using `unknown` makes TypeScript force us to check the data type before we can
 * continue to use it, hence the `if` statement. You can check it out for yourself
 * right now. Just add `console.log(error.code);` at the top of the function, you
 * will notice that TypeScript will complain.
 * So the check comes first, and if it fails, then it is an unexpected error.
 */
export const onError = (
  error: unknown,
  request: Request,
  response: Response,
  _next: NextFunction,
): void => {

  if (error instanceof AppError) {
    request.log?.info(
      { code: error.code, statusCode: error.statusCode, },
      error.message,
    );

    response.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
      },
    });

    return;
  }

  logger.error({ err: error }, ErrorCodes.unexpected.message);

  response.status(500).json({
    error: {
      code: ErrorCodes.internal.code,
      message: ErrorCodes.internal.message,
    },
  });
}