import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/app-error';
import { sendError } from '../utils/api-response';
import { logger } from '../utils/logger';

/**
 * Global error handler middleware.
 * Catches all errors thrown/forwarded from routes and sends a consistent JSON response.
 */
export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    sendError(res, err.statusCode, err.message, err.details);
    return;
  }

  // Log unexpected errors
  logger.error('Unhandled error', err);

  sendError(res, 500, 'Internal server error');
}
