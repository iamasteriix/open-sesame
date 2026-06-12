export const ErrorCodes = {
  // Generic
  internal: {
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Something went wrong',
  },
  unexpected: {
    code: 'UNEXPECTED_ERROR',
    message: 'Unexpected',
  },

  // Auth
  unauthorized: {
    code: 'UNAUTHORIZED',
    message: 'Unauthorized',
  },
  forbidden: {
    code: 'FORBIDDEN',
    message: 'Not allowed',
  },
  tokenExpired: {
    code: 'TOKEN_EXPIRED',
    message: 'Token expired',
  },
  tokenRevoked: {
    code: 'TOKEN_REVOKED',
    message: 'Token revoked',
  },

  // Resources
  notFound: {
    code: 'NOT_FOUND',
    message: 'Not found',
  },

  // Validation
  validationError: {
    code: 'VALIDATION_ERROR',
    message: 'Validation error',
  },
  badPassword: {
    code: 'BAD_PASSWORD',
    message: 'Bad password',
  },
} as const;