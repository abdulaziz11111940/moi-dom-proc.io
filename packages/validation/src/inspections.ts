import {
  INSPECTION_PARTICIPANT_ROLES,
  INSPECTION_RATINGS,
  INSPECTION_STATUSES,
  SUBJECT_CODES,
} from '@femida/types';
import { z } from 'zod';

import { uuidSchema } from './common';

const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/u, 'Ожидается дата в формате ГГГГ-ММ-ДД')
  .optional()
  .or(z.literal(''));

const linkSchema = z
  .string()
  .trim()
  .max(1024, 'Ссылка не должна превышать 1024 символа')
  .refine((value) => value === '' || /^https?:\/\//u.test(value), {
    message: 'Ссылка должна начинаться с http:// или https://',
  })
  .optional()
  .or(z.literal(''));

/** Создание проверки. */
export const createInspectionSchema = z.object({
  subjectCode: z.enum(SUBJECT_CODES, { errorMap: () => ({ message: 'Выберите субъект' }) }),
  typeLabel: z
    .string()
    .trim()
    .min(3, 'Название типа слишком короткое')
    .max(191, 'Название типа не должно превышать 191 символ')
    .default('Плановая проверка'),
  factionId: z.string().trim().max(64).optional().or(z.literal('')),
  basisText: z.string().trim().max(4000, 'Основание не должно превышать 4000 символов').optional().or(z.literal('')),
  basisLink: linkSchema,
  description: z
    .string()
    .trim()
    .max(8000, 'Описание не должно превышать 8000 символов')
    .optional()
    .or(z.literal('')),
  periodFrom: dateSchema,
  periodTo: dateSchema,
  startsAt: z.string().datetime({ offset: true }).optional().or(z.literal('')),
  endsAt: z.string().datetime({ offset: true }).optional().or(z.literal('')),
});

export type CreateInspectionInput = z.infer<typeof createInspectionSchema>;

/** Изменение метаданных проверки. */
export const updateInspectionSchema = z.object({
  typeLabel: z.string().trim().min(3).max(191).optional(),
  factionId: z.string().trim().max(64).optional().or(z.literal('')),
  basisText: z.string().trim().max(4000).optional().or(z.literal('')),
  basisLink: linkSchema,
  description: z.string().trim().max(8000).optional().or(z.literal('')),
  notesText: z.string().trim().max(4000).optional().or(z.literal('')),
  periodFrom: dateSchema,
  periodTo: dateSchema,
  startsAt: z.string().datetime({ offset: true }).optional().or(z.literal('')),
  endsAt: z.string().datetime({ offset: true }).optional().or(z.literal('')),
  version: z.number().int().positive(),
});

export type UpdateInspectionInput = z.infer<typeof updateInspectionSchema>;

/**
 * Действие жизненного цикла.
 *
 * Утверждение сопровождается итоговой оценкой и заключением; отмена и
 * переоткрытие требуют основания.
 */
export const inspectionActionSchema = z.object({
  action: z.enum(['activate', 'complete', 'submit', 'approve', 'reopen', 'cancel'], {
    errorMap: () => ({ message: 'Недопустимое действие' }),
  }),
  reason: z.string().trim().max(1000, 'Основание не должно превышать 1000 символов').optional().or(z.literal('')),
  finalRating: z.enum(INSPECTION_RATINGS).optional(),
  finalConclusion: z.string().trim().max(8000).optional().or(z.literal('')),
  resolutionText: z.string().trim().max(8000).optional().or(z.literal('')),
  version: z.number().int().positive(),
});

export type InspectionActionInput = z.infer<typeof inspectionActionSchema>;

/** Добавление участника комиссии. */
export const addInspectionParticipantSchema = z.object({
  userProfileId: uuidSchema,
  role: z.enum(INSPECTION_PARTICIPANT_ROLES).default('MEMBER'),
});

export type AddInspectionParticipantInput = z.infer<typeof addInspectionParticipantSchema>;

/** Параметры выборки реестра проверок. */
export const inspectionQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(5).max(100).default(20),
  sortBy: z.enum(['createdAt', 'startsAt', 'status', 'regNumber']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().trim().max(191).optional(),
  subjectCode: z.enum(SUBJECT_CODES).optional(),
  status: z.enum(INSPECTION_STATUSES).optional(),
});

export type InspectionQueryInput = z.infer<typeof inspectionQuerySchema>;
