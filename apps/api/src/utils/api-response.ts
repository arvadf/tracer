import { Response } from 'express';
import { PaginationMeta } from '../types';

export function sendSuccess<T>(res: Response, data: T, message = 'Success', statusCode = 200): void {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

export function sendCreated<T>(res: Response, data: T, message = 'Created successfully'): void {
  sendSuccess(res, data, message, 201);
}

export function sendPaginated<T>(
  res: Response,
  items: T[],
  meta: PaginationMeta,
  message = 'Data retrieved successfully'
): void {
  res.status(200).json({
    success: true,
    message,
    data: {
      items,
      meta,
    },
  });
}

export function sendError(
  res: Response,
  statusCode: number,
  message: string,
  errors?: Array<{ field?: string; message: string }>
): void {
  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && errors.length > 0 ? { errors } : {}),
  });
}
