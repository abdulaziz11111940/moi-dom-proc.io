import { POSITION_CODES, SUBJECT_CODES } from '@femida/types';
import { z } from 'zod';

/** Параметры выборки штатного расписания. */
export const staffScheduleQuerySchema = z.object({
  subjectCode: z.enum(SUBJECT_CODES).optional(),
  /** Показывать должности, по которым нет ни единиц, ни сотрудников. */
  includeEmpty: z
    .union([z.boolean(), z.literal('true'), z.literal('false')])
    .transform((value) => value === true || value === 'true')
    .optional()
    .default(false),
});

export type StaffScheduleQueryInput = z.infer<typeof staffScheduleQuerySchema>;

const positionCodeSchema = z.string().refine((code) => POSITION_CODES.includes(code), {
  message: 'Должность отсутствует в справочнике',
});

const plannedUnitsSchema = z
  .number({ required_error: 'Укажите количество единиц' })
  .int('Количество единиц должно быть целым')
  .min(0, 'Количество единиц не может быть отрицательным')
  .max(999, 'Слишком большое количество единиц');

const allocationTitleSchema = z
  .string()
  .trim()
  .min(3, 'Название должности слишком короткое')
  .max(255, 'Название должности не должно превышать 255 символов')
  .optional()
  .or(z.literal(''));

const allocationNoteSchema = z
  .string()
  .trim()
  .max(512, 'Примечание не должно превышать 512 символов')
  .optional()
  .or(z.literal(''));

/**
 * Новая строка штатного расписания субъекта.
 *
 * `positionCode` — должность справочника: она задаёт роль, диапазон классного
 * чина и базу премии. `title` — название в этом субъекте, например «Прокурор
 * ПФО»; пусто — берётся название справочника. Строк с одной должностью может
 * быть несколько: два отдела одного уровня — разные должности.
 */
export const createStaffAllocationSchema = z.object({
  subjectCode: z.enum(SUBJECT_CODES, { errorMap: () => ({ message: 'Выберите субъект' }) }),
  positionCode: positionCodeSchema,
  title: allocationTitleSchema,
  plannedUnits: plannedUnitsSchema,
  note: allocationNoteSchema,
});

export type CreateStaffAllocationInput = z.infer<typeof createStaffAllocationSchema>;

/** Изменение существующей строки расписания. */
export const editStaffAllocationSchema = z.object({
  title: allocationTitleSchema,
  plannedUnits: plannedUnitsSchema,
  note: allocationNoteSchema,
  version: z.number().int().positive(),
});

export type EditStaffAllocationInput = z.infer<typeof editStaffAllocationSchema>;

/**
 * Изменение норматива штатных единиц.
 *
 * Ноль допустим: он означает, что должность в субъекте не предусмотрена.
 * Верхняя граница защищает от опечатки вида «1000» вместо «10».
 */
export const updateStaffAllocationSchema = z.object({
  subjectCode: z.enum(SUBJECT_CODES, { errorMap: () => ({ message: 'Выберите субъект' }) }),
  positionCode: positionCodeSchema,
  plannedUnits: z
    .number({ required_error: 'Укажите количество единиц' })
    .int('Количество единиц должно быть целым')
    .min(0, 'Количество единиц не может быть отрицательным')
    .max(999, 'Слишком большое количество единиц'),
  note: z
    .string()
    .trim()
    .max(512, 'Примечание не должно превышать 512 символов')
    .optional()
    .or(z.literal('')),
  /** Отсутствует при первом задании норматива. */
  version: z.number().int().positive().optional(),
});

export type UpdateStaffAllocationInput = z.infer<typeof updateStaffAllocationSchema>;

/** Массовое изменение расписания субъекта. */
export const updateStaffScheduleSchema = z.object({
  subjectCode: z.enum(SUBJECT_CODES, { errorMap: () => ({ message: 'Выберите субъект' }) }),
  lines: z
    .array(
      z.object({
        positionCode: positionCodeSchema,
        plannedUnits: z.number().int().min(0).max(999),
      }),
    )
    .min(1, 'Не указано ни одной должности')
    .max(100, 'Слишком много строк за один раз')
    .superRefine((lines, ctx) => {
      const seen = new Set<string>();

      for (const line of lines) {
        if (seen.has(line.positionCode)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Должность указана дважды: ${line.positionCode}`,
          });
        }
        seen.add(line.positionCode);
      }
    }),
  note: z.string().trim().max(512).optional().or(z.literal('')),
});

export type UpdateStaffScheduleInput = z.infer<typeof updateStaffScheduleSchema>;
