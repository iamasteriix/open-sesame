import { ErrorCodes } from "@open-sesame/common";


export class AppError extends Error {
  constructor (
    public readonly message: string,
    public readonly statusCode: number,
    public readonly code: string,
  ) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}


export class NotFoundError extends AppError {
  constructor(message = ErrorCodes.notFound.message) {
    super(message, 404, ErrorCodes.notFound.code);
  }
}


export class ValidationError extends AppError {
  constructor(message = ErrorCodes.validationError.message) {
    super(message, 400, ErrorCodes.validationError.code);
  }
}


export class UnauthorizedError extends AppError {
  constructor (message = ErrorCodes.unauthorized.message) {
    super(message, 401, ErrorCodes.unauthorized.code);
  }
}


export class ForbiddenError extends AppError {
  constructor(message = ErrorCodes.forbidden.message) {
    super(message, 403, ErrorCodes.forbidden.message);
  }
}