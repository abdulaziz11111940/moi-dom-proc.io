import { AUDIT_RESULTS, SUBJECT_CODES } from '@femida/types';
import { z } from 'zod';

export const auditQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(10).max(100).default(30),
  action: z.string().trim().max(128).optional(),
  actorProfileId: z.string().uuid().optional(),
  subjectCode: z.enum(SUBJECT_CODES).optional(),
  result: z.enum(AUDIT_RESULTS).optional(),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/u).optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/u).optional(),
});

export type AuditQueryInput = z.infer<typeof auditQuerySchema>;
