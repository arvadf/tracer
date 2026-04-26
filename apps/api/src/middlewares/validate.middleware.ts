import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AppError } from '../utils/app-error';

/**
 * Factory: creates a middleware that validates req.body / req.query / req.params
 * against a Zod schema. Compatible with Zod v4.
 */
export function validate(schema: z.ZodType, source: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const data = schema.parse(req[source]);
      // Replace with parsed/coerced data overriding Express getter
      Object.defineProperty(req, source, {
        value: data,
        writable: true,
        enumerable: true,
        configurable: true,
      });
      next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        const details = err.issues.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        next(AppError.validation(details));
        return;
      }
      next(err);
    }
  };
}
