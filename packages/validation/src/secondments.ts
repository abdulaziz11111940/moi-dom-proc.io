import { ROLES, SECONDMENT_STATUSES, SUBJECT_CODES } from '@femida/types';
import { z } from 'zod';

export const secondmentQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(5).max(100).default(20),
  status: z.enum(SECONDMENT_STATUSES).optional(),
  hostSubjectCode: z.enum(SUBJECT_CODES).optional(),
  search: z.string().trim().max(191).optional(),
});

export type SecondmentQueryInput = z.infer<typeof secondmentQuerySchema>;

export const createSecondmentSchema = z
  .object({
    userProfileId: z.string().uuid(),
    hostSubjectCode: z.enum(SUBJECT_CODES),
    position: z.string().trim().min(2).max(255),
    role: z.enum(ROLES),
    reason: z.string().trim().min(5, 'Основание должно содержать не менее 5 символов').max(512),
    startAt: z.string().datetime(),
    endAt: z.string().datetime(),
  })
  .refine((value) => new Date(value.endAt).getTime() > new Date(value.startAt).getTime(), {
    message: 'Дата завершения должна быть позже даты начала',
    path: ['endAt'],
  });

export type CreateSecondmentInput = z.infer<typeof createSecondmentSchema>;

/** Продление командировки: только новая дата завершения. */
export const extendSecondmentSchema = z.object({
  endAt: z.string().datetime(),
  version: z.number().int().positive(),
});

export type ExtendSecondmentInput = z.infer<typeof extendSecondmentSchema>;

/** Досрочное завершение или отмена. */
export const endSecondmentSchema = z.object({
  reason: z.string().trim().min(5).max(512),
  version: z.number().int().positive(),
});

export type EndSecondmentInput = z.infer<typeof endSecondmentSchema>;
