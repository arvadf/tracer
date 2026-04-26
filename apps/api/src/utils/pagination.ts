import { PaginationMeta, PaginationParams } from '../types';
import { PAGINATION_DEFAULTS } from '../constants';

/**
 * Parse raw query params into validated pagination params.
 */
export function parsePaginationParams(query: Record<string, unknown>): PaginationParams {
  const page = Math.max(1, parseInt(String(query.page || PAGINATION_DEFAULTS.PAGE), 10) || PAGINATION_DEFAULTS.PAGE);
  const rawLimit = parseInt(String(query.limit || PAGINATION_DEFAULTS.LIMIT), 10) || PAGINATION_DEFAULTS.LIMIT;
  const limit = Math.min(Math.max(1, rawLimit), PAGINATION_DEFAULTS.MAX_LIMIT);

  const sortByRaw = String(query.sort_by || '');
  const sort_by = sortByRaw || undefined;

  const sortOrderRaw = String(query.sort_order || '').toLowerCase();
  const sort_order: 'asc' | 'desc' = sortOrderRaw === 'desc' ? 'desc' : 'asc';

  return { page, limit, sort_by, sort_order };
}

/**
 * Build pagination meta from total count and current params.
 */
export function buildPaginationMeta(totalItems: number, params: PaginationParams): PaginationMeta {
  const total_pages = Math.ceil(totalItems / params.limit) || 1;
  return {
    current_page: params.page,
    limit: params.limit,
    total_items: totalItems,
    total_pages,
    has_next_page: params.page < total_pages,
    has_prev_page: params.page > 1,
  };
}

/**
 * Calculate SQL OFFSET from pagination params.
 */
export function calcOffset(params: PaginationParams): number {
  return (params.page - 1) * params.limit;
}
