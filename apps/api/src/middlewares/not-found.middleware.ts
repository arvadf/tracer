import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/api-response';

/**
 * Catch-all for undefined routes.
 */
export function notFoundHandler(_req: Request, res: Response, _next: NextFunction): void {
  sendError(res, 404, 'Endpoint not found');
}
