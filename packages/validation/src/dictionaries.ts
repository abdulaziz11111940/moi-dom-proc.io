import { POSITION_GROUPS, POSITION_SCOPES, ROLES } from '@femida/types';
import { z } from 'zod';

const dictionaryCodeSchema = z
  .string()
  .trim()
  .min(2, 'Код должен содержать не менее 2 символов')
  .max(64, 'Код не должен превышать 64 символа')
  .regex(/^[A-Z][A-Z0-9_]*$/, 'Используйте латинские заглавные буквы, цифры и подчёркивание');

/** Редактирование субъекта: системный код после создания неизменен. */
export const updateSubjectDictionarySchema = z.object({
  name: z.string().trim().min(2).max(191),
  shortName: z.string().trim().min(1).max(32),
  sortOrder: z.coerce.number().int().min(0).max(9999),
  isActive: z.boolean(),
});

export type UpdateSubjectDictionaryInput = z.infer<typeof updateSubjectDictionarySchema>;

export const createSubjectDictionarySchema = updateSubjectDictionarySchema.extend({
  code: dictionaryCodeSchema,
});

export type CreateSubjectDictionaryInput = z.infer<typeof createSubjectDictionarySchema>;

const rankTitle = z.string().trim().max(64).optional().or(z.literal(''));
const dictionaryIconUrl = z
  .string()
  .trim()
  .max(1024)
  .refine(
    (value) => value === '' || /^(https?:\/\/|\/)[^\s<>"']+$/u.test(value),
    'Укажите URL http(s) или путь от корня сайта',
  )
  .nullable()
  .optional();

/** Редактирование должности: код неизменен, чтобы не разорвать связи. */
export const updatePositionDictionarySchema = z.object({
  title: z.string().trim().min(2).max(255),
  group: z.enum(POSITION_GROUPS),
  scope: z.enum(POSITION_SCOPES),
  level: z.coerce.number().int().min(1).max(99),
  role: z.enum(ROLES),
  minRank: rankTitle,
  maxRank: rankTitle,
  isActive: z.boolean(),
});

export type UpdatePositionDictionaryInput = z.infer<typeof updatePositionDictionarySchema>;

export const createPositionDictionarySchema = updatePositionDictionarySchema.extend({
  code: dictionaryCodeSchema,
});

export type CreatePositionDictionaryInput = z.infer<typeof createPositionDictionarySchema>;

export const createMedalDictionarySchema = z.object({
  code: dictionaryCodeSchema,
  title: z.string().trim().min(2).max(191),
  iconUrl: dictionaryIconUrl,
  isActive: z.boolean(),
});

export type CreateMedalDictionaryInput = z.infer<typeof createMedalDictionarySchema>;

export const updateMedalDictionarySchema = z.object({
  title: z.string().trim().min(2).max(191),
  iconUrl: dictionaryIconUrl,
  isActive: z.boolean(),
});

export type UpdateMedalDictionaryInput = z.infer<typeof updateMedalDictionarySchema>;

export const updateClassRankDictionarySchema = z.object({
  title: z.string().trim().min(2).max(191),
  iconUrl: dictionaryIconUrl,
  order: z.coerce.number().int().min(1).max(999),
  tenureDays: z.coerce.number().int().min(1).max(3650).nullable().optional(),
  awardedBy: z.enum(['SUBJECT_PROSECUTOR', 'PROSECUTOR_GENERAL', 'PRESIDENT']),
  isActive: z.boolean(),
});

export type UpdateClassRankDictionaryInput = z.infer<typeof updateClassRankDictionarySchema>;

export const createClassRankDictionarySchema = updateClassRankDictionarySchema.extend({
  code: dictionaryCodeSchema,
});

export type CreateClassRankDictionaryInput = z.infer<typeof createClassRankDictionarySchema>;
