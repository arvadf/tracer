export class AppError extends Error {
  public readonly statusCode: number;
  public readonly details?: Array<{ field?: string; message: string }>;

  constructor(
    statusCode: number,
    message: string,
    details?: Array<{ field?: string; message: string }>
  ) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, AppError.prototype);
  }

  static badRequest(message: string, details?: Array<{ field?: string; message: string }>): AppError {
    return new AppError(400, message, details);
  }

  static unauthorized(message = 'Unauthorized'): AppError {
    return new AppError(401, message);
  }

  static forbidden(message = 'Forbidden'): AppError {
    return new AppError(403, message);
  }

  static notFound(message = 'Resource not found'): AppError {
    return new AppError(404, message);
  }

  static conflict(message: string): AppError {
    return new AppError(409, message);
  }

  static validation(details: Array<{ field?: string; message: string }>): AppError {
    return new AppError(422, 'Validation failed', details);
  }

  static internal(message = 'Internal server error'): AppError {
    return new AppError(500, message);
  }
}
