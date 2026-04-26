import { z } from 'zod';

/**
 * Import confirm body validation.
 */
export const importConfirmSchema = z.object({
  import_id: z.string().uuid('import_id harus berformat UUID'),
});

export type ImportConfirmInput = z.infer<typeof importConfirmSchema>;
