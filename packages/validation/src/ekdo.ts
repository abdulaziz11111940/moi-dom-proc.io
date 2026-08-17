import { EKDO_ORDER_KINDS, EKDO_ORDER_STATUSES, EKDO_TRIP_ROLES } from '@femida/types';
import { z } from 'zod';

const dateOnly = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Укажите дату');

export const ekdoOrderDetailsSchema = z.object({
  position: z.string().trim().min(2).max(255).optional(),
  targetSubjectCode: z.string().trim().min(2).max(64).optional(),
  targetSubjectName: z.string().trim().min(2).max(191).optional(),
  endAt: dateOnly.optional(),
  awardCode: z.string().trim().min(2).max(64).optional(),
  awardTitle: z.string().trim().min(2).max(191).optional(),
  tripRole: z.enum(EKDO_TRIP_ROLES).optional(),
});

export const createEkdoOrderSchema = z
  .object({
    kind: z.enum(EKDO_ORDER_KINDS),
    targetEmployeeId: z.string().uuid(),
    targetRank: z.string().trim().min(2).max(191).optional(),
    title: z.string().trim().min(10).max(255),
    preamble: z.string().trim().min(20).max(4000),
    decisionText: z.string().trim().min(10).max(6000),
    reason: z.string().trim().min(10).max(1000),
    controlText: z.string().trim().min(5).max(1000),
    place: z.string().trim().min(2).max(128),
    effectiveAt: dateOnly,
    manualNumber: z.string().trim().min(1).max(128).optional(),
    details: ekdoOrderDetailsSchema.default({}),
  })
  .superRefine((input, context) => {
    const requireField = (condition: boolean, field: string, message: string): void => {
      if (!condition) {
        context.addIssue({ code: z.ZodIssueCode.custom, path: ['details', field], message });
      }
    };
    if (input.kind === 'RANK_ASSIGNMENT' && !input.targetRank) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['targetRank'],
        message: 'Укажите классный чин',
      });
    }
    if (input.kind === 'HIRING' || input.kind === 'APPOINTMENT') {
      requireField(Boolean(input.details.position), 'position', 'Укажите новую должность');
    }
    if (input.kind === 'TRANSFER') {
      requireField(
        Boolean(input.details.targetSubjectCode),
        'targetSubjectCode',
        'Укажите субъект',
      );
      requireField(Boolean(input.details.position), 'position', 'Укажите должность после перевода');
    }
    if (input.kind === 'AWARD') {
      requireField(Boolean(input.details.awardCode), 'awardCode', 'Укажите награду');
    }
    if (input.kind === 'BUSINESS_TRIP') {
      requireField(
        Boolean(input.details.targetSubjectCode),
        'targetSubjectCode',
        'Укажите субъект',
      );
      requireField(Boolean(input.details.position), 'position', 'Укажите временную должность');
      requireField(Boolean(input.details.endAt), 'endAt', 'Укажите дату завершения');
      requireField(Boolean(input.details.tripRole), 'tripRole', 'Укажите временную роль');
      if (input.details.endAt && input.details.endAt < input.effectiveAt) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['details', 'endAt'],
          message: 'Дата завершения должна быть позже даты начала',
        });
      }
    }
  });

/** Совместимый псевдоним первого шаблона. */
export const createEkdoRankOrderSchema = createEkdoOrderSchema;
export type CreateEkdoOrderInput = z.infer<typeof createEkdoOrderSchema>;
export type CreateEkdoRankOrderInput = CreateEkdoOrderInput;

export const updateEkdoOrderSchema = createEkdoOrderSchema.and(
  z.object({ version: z.number().int().positive() }),
);
export const updateEkdoRankOrderSchema = updateEkdoOrderSchema;
export type UpdateEkdoOrderInput = z.infer<typeof updateEkdoOrderSchema>;
export type UpdateEkdoRankOrderInput = UpdateEkdoOrderInput;

export const ekdoOrderQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(191).optional(),
  status: z.enum(EKDO_ORDER_STATUSES).optional(),
  subjectCode: z.string().trim().max(64).optional(),
});
export type EkdoOrderQueryInput = z.infer<typeof ekdoOrderQuerySchema>;

export const cancelEkdoOrderSchema = z.object({
  reason: z.string().trim().min(10).max(1000),
});
export type CancelEkdoOrderInput = z.infer<typeof cancelEkdoOrderSchema>;

export const setEkdoPersonnelOfficerSchema = z.object({
  personnelOfficerId: z.string().uuid().nullable(),
});
export type SetEkdoPersonnelOfficerInput = z.infer<typeof setEkdoPersonnelOfficerSchema>;
