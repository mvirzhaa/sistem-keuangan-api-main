/**
 * Base Custom Error Class
 */
export abstract class BaseError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;

    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this);
  }
}

/**
 * 404 - Not Found Error
 */
export class NotFoundError extends BaseError {
  constructor(message = "Resource not found") {
    super(message, 404);
  }
}

/**
 * 409 - Conflict Error
 */
export class ConflictError extends BaseError {
  constructor(message = "Resource conflict") {
    super(message, 409);
  }
}

/**
 * 400 - Bad Request Error
 */
export class BadRequestError extends BaseError {
  constructor(message = "Bad request") {
    super(message, 400);
  }
}

/**
 * 401 - Unauthorized Error
 */
export class UnauthorizedError extends BaseError {
  constructor(message = "Unauthorized") {
    super(message, 401);
  }
}

/**
 * 403 - Forbidden Error
 */
export class ForbiddenError extends BaseError {
  constructor(message = "Forbidden") {
    super(message, 403);
  }
}

/**
 * 500 - Internal Server Error
 */
export class InternalServerError extends BaseError {
  constructor(message = "Internal server error") {
    super(message, 500);
  }
}
