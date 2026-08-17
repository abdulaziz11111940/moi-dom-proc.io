import { APPLICATION_STATUSES, ROLES, SUBJECT_CODES } from '@femida/types';
import { z } from 'zod';

export const applicationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(5).max(100).default(20),
  status: z.enum(APPLICATION_STATUSES).optional(),
  subjectCode: z.enum(SUBJECT_CODES).optional(),
});

export type ApplicationQueryInput = z.infer<typeof applicationQuerySchema>;

/**
 * Одобрение заявки.
 *
 * Возможны два исхода. Либо заводится новая учётная запись — тогда обязательны
 * роль и должность. Либо заявка привязывается к уже существующему профилю
 * (`linkToProfileId`): сотрудник в системе уже есть, дубликат заводить не нужно.
 * Во втором случае роль и должность не требуются — они меняются в личном деле,
 * а не через очередь заявок.
 */
export const approveApplicationSchema = z
  .object({
    linkToProfileId: z.string().uuid().optional(),
    grantedRole: z.enum(ROLES).optional(),
    grantedPosition: z.string().trim().min(2).max(191).optional(),
    reviewComment: z.string().trim().max(1000).optional().or(z.literal('')),
    version: z.number().int().positive(),
  })
  .refine(
    (value) => Boolean(value.linkToProfileId) || Boolean(value.grantedRole && value.grantedPosition),
    {
      message: 'Укажите роль и должность для новой учётной записи',
      path: ['grantedPosition'],
    },
  );

export type ApproveApplicationInput = z.infer<typeof approveApplicationSchema>;

const reasonSchema = z
  .string({ required_error: 'Укажите основание' })
  .trim()
  .min(5, 'Основание должно содержать не менее 5 символов')
  .max(1000, 'Основание не должно превышать 1000 символов');

/** Отклонение или возврат заявки на уточнение. */
export const decideApplicationSchema = z.object({
  reviewComment: reasonSchema,
  version: z.number().int().positive(),
});

export type DecideApplicationInput = z.infer<typeof decideApplicationSchema>;
