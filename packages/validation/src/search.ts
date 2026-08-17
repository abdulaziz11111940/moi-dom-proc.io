import { z } from 'zod';

export const searchQuerySchema = z.object({
  q: z.string().trim().min(2, 'Введите не менее 2 символов').max(191),
});

export type SearchQueryInput = z.infer<typeof searchQuerySchema>;
