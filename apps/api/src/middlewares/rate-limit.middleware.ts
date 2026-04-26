import rateLimit from 'express-rate-limit';

/**
 * General rate limiter for public endpoints.
 * 60 requests per minute per IP.
 */
export const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Terlalu banyak request. Coba lagi nanti.',
  },
});

/**
 * Strict rate limiter for critical public endpoints (search, submit survey).
 * 30 requests per minute per IP.
 */
export const strictLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Terlalu banyak request. Coba lagi nanti.',
  },
});

/**
 * Moderate rate limiter for search.
 * 150 requests per minute per IP.
 */
export const searchLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 150,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Terlalu banyak request pencarian. Coba lagi dalam beberapa saat.',
  },
});
