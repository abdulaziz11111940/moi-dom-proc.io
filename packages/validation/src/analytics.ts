import { SUBJECT_CODES } from '@femida/types';
import { z } from 'zod';

export const analyticsQuerySchema = z.object({
  period: z.string().regex(/^\d{4}-\d{2}$/u).optional(),
  subjectCode: z.enum(SUBJECT_CODES).optional(),
});

export type AnalyticsQueryInput = z.infer<typeof analyticsQuerySchema>;
