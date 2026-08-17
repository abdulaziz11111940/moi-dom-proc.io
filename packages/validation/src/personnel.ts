import { EMPLOYEE_STATUSES, PERSONNEL_SCOPES, ROLES, SUBJECT_CODES } from '@femida/types';
import { z } from 'zod';

import { discordIdSchema, fullNameSchema, positionSchema, uuidSchema } from './common';

const reasonSchema = z
  .string({ required_error: 'Укажите основание' })
  .trim()
  .min(10, 'Основание должно содержать не менее 10 символов')
  .max(1000, 'Основание не должно превышать 1000 символов');

const documentRefSchema = z
  .string()
  .trim()
  .max(255, 'Реквизиты документа не должны превышать 255 символов')
  .optional()
  .or(z.literal(''));

const effectiveAtSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/u, 'Ожидается дата в формате ГГГГ-ММ-ДД')
  .optional()
  .or(z.literal(''));

/** Изменение анкетных сведений личного дела. */
export const updatePersonnelProfileSchema = z.object({
  fullName: fullNameSchema.optional(),
  discordId: discordIdSchema.optional().or(z.literal('')),
  serviceId: z
    .string()
    .trim()
    .max(64, 'Служебный номер не должен превышать 64 символа')
    .optional()
    .or(z.literal('')),
  contactInfo: z
    .string()
    .trim()
    .max(512, 'Контактные сведения не должны превышать 512 символов')
    .optional()
    .or(z.literal('')),
  managerId: uuidSchema.nullable().optional(),
  hiredAt: effectiveAtSchema,
  version: z.number().int().positive(),
});

export type UpdatePersonnelProfileInput = z.infer<typeof updatePersonnelProfileSchema>;

/** Назначение на должность. */
export const changePositionSchema = z.object({
  position: positionSchema,
  reason: reasonSchema.optional().or(z.literal('')),
  documentRef: documentRefSchema,
  effectiveAt: effectiveAtSchema,
  version: z.number().int().positive(),
});

export type ChangePositionInput = z.infer<typeof changePositionSchema>;

/** Присвоение классного чина. */
export const assignRankSchema = z.object({
  rank: z
    .string({ required_error: 'Укажите классный чин' })
    .trim()
    .min(3, 'Название чина слишком короткое')
    .max(191, 'Название чина не должно превышать 191 символ'),
  reason: reasonSchema.optional().or(z.literal('')),
  documentRef: documentRefSchema,
  effectiveAt: effectiveAtSchema,
  version: z.number().int().positive(),
});

export type AssignRankInput = z.infer<typeof assignRankSchema>;

/**
 * Изменение роли в системе.
 * Основание обязательно: роль определяет объём доступа к данным.
 */
export const changeRoleSchema = z.object({
  role: z.enum(ROLES, { errorMap: () => ({ message: 'Выберите роль' }) }),
  reason: reasonSchema,
  documentRef: documentRefSchema,
  effectiveAt: effectiveAtSchema,
  version: z.number().int().positive(),
});

export type ChangeRoleInput = z.infer<typeof changeRoleSchema>;

/** Перевод сотрудника в другой субъект. */
export const transferSubjectSchema = z.object({
  subjectCode: z.enum(SUBJECT_CODES, {
    errorMap: () => ({ message: 'Выберите субъект' }),
  }),
  position: positionSchema.optional().or(z.literal('')),
  reason: reasonSchema,
  documentRef: documentRefSchema,
  effectiveAt: effectiveAtSchema,
  version: z.number().int().positive(),
});

export type TransferSubjectInput = z.infer<typeof transferSubjectSchema>;

/**
 * Изменение статуса: отстранение, восстановление, увольнение,
 * зачисление в резерв.
 */
export const changeEmployeeStatusSchema = z
  .object({
    status: z.enum(EMPLOYEE_STATUSES, {
      errorMap: () => ({ message: 'Выберите статус' }),
    }),
    reason: z
      .string()
      .trim()
      .max(1000, 'Основание не должно превышать 1000 символов')
      .optional()
      .or(z.literal('')),
    documentRef: documentRefSchema,
    effectiveAt: effectiveAtSchema,
    version: z.number().int().positive(),
  })
  .superRefine((data, ctx) => {
    // Решения, ограничивающие права сотрудника, должны быть обоснованы.
    const requiresReason: string[] = ['SUSPENDED', 'DISMISSED', 'RESERVE', 'BLOCKED'];

    if (requiresReason.includes(data.status) && (data.reason ?? '').trim().length < 10) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['reason'],
        message: 'Укажите основание не короче 10 символов',
      });
    }
  });

export type ChangeEmployeeStatusInput = z.infer<typeof changeEmployeeStatusSchema>;

/** Служебная заметка личного дела. */
export const personnelNoteSchema = z.object({
  body: z
    .string({ required_error: 'Введите текст заметки' })
    .trim()
    .min(3, 'Заметка слишком короткая')
    .max(4000, 'Заметка не должна превышать 4000 символов'),
});

export type PersonnelNoteInput = z.infer<typeof personnelNoteSchema>;

/** Приём на службу: создание личного дела. */
export const createPersonnelFileSchema = z.object({
  fullName: fullNameSchema,
  subjectCode: z.enum(SUBJECT_CODES, {
    errorMap: () => ({ message: 'Выберите субъект' }),
  }),
  position: positionSchema,
  rank: z.string().trim().max(191).optional().or(z.literal('')),
  discordId: discordIdSchema.optional().or(z.literal('')),
  serviceId: z.string().trim().max(64).optional().or(z.literal('')),
  contactInfo: z.string().trim().max(512).optional().or(z.literal('')),
  role: z.enum(ROLES).default('EMPLOYEE'),
  managerId: uuidSchema.optional().or(z.literal('')),
  hiredAt: effectiveAtSchema,
  documentRef: documentRefSchema,
});

export type CreatePersonnelFileInput = z.infer<typeof createPersonnelFileSchema>;

/** Параметры выборки реестра личных дел. */
export const personnelQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(5).max(100).default(20),
  sortBy: z.enum(['fullName', 'appointedAt', 'status', 'position']).default('fullName'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
  search: z.string().trim().max(191).optional(),
  subjectCode: z.enum(SUBJECT_CODES).optional(),
  status: z.enum(EMPLOYEE_STATUSES).optional(),
  role: z.enum(ROLES).optional(),
  /**
   * Часть реестра. По умолчанию показываются состоящие на службе:
   * уволенные и заблокированные вынесены в архив.
   */
  scope: z.enum(PERSONNEL_SCOPES).default('SERVICE'),
});

export type PersonnelQueryInput = z.infer<typeof personnelQuerySchema>;
