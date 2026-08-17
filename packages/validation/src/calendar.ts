import {
  CALENDAR_EVENT_TYPES,
  CALENDAR_EVENT_VISIBILITIES,
  SUBJECT_CODES,
} from '@femida/types';
import { z } from 'zod';

import { uuidSchema } from './common';

const dateOnlySchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/u, 'Ожидается дата в формате ГГГГ-ММ-ДД');

const dateTimeSchema = z.string().datetime({ offset: true });

const titleSchema = z
  .string()
  .trim()
  .min(3, 'Название слишком короткое')
  .max(255, 'Название не должно превышать 255 символов');

const descriptionSchema = z
  .string()
  .trim()
  .max(8000, 'Описание не должно превышать 8000 символов')
  .optional()
  .or(z.literal(''));

const locationSchema = z
  .string()
  .trim()
  .max(255, 'Место не должно превышать 255 символов')
  .optional()
  .or(z.literal(''));

/**
 * Общие проверки согласованности события:
 *   * привязка возможна либо к проверке, либо к обращению, но не к обеим сразу;
 *   * окончание не может предшествовать началу.
 */
function refineEvent(
  value: { startsAt?: string; endsAt?: string; inspectionId?: string; appealId?: string },
  ctx: z.RefinementCtx,
): void {
  if (value.inspectionId && value.appealId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['appealId'],
      message: 'Событие можно привязать только к одной сущности: проверке или обращению',
    });
  }

  if (value.startsAt && value.endsAt && new Date(value.endsAt) < new Date(value.startsAt)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['endsAt'],
      message: 'Окончание не может быть раньше начала',
    });
  }
}

/** Создание события. */
export const createCalendarEventSchema = z
  .object({
    title: titleSchema,
    description: descriptionSchema,
    type: z.enum(CALENDAR_EVENT_TYPES).default('MEETING'),
    visibility: z.enum(CALENDAR_EVENT_VISIBILITIES).default('SUBJECT'),
    subjectCode: z.enum(SUBJECT_CODES, { errorMap: () => ({ message: 'Выберите субъект' }) }),
    location: locationSchema,
    startsAt: dateTimeSchema,
    endsAt: dateTimeSchema.optional().or(z.literal('')),
    allDay: z.coerce.boolean().default(false),
    inspectionId: uuidSchema.optional().or(z.literal('')),
    appealId: uuidSchema.optional().or(z.literal('')),
  })
  .superRefine(refineEvent);

export type CreateCalendarEventInput = z.infer<typeof createCalendarEventSchema>;

/** Изменение события. */
export const updateCalendarEventSchema = z
  .object({
    title: titleSchema.optional(),
    description: descriptionSchema,
    type: z.enum(CALENDAR_EVENT_TYPES).optional(),
    visibility: z.enum(CALENDAR_EVENT_VISIBILITIES).optional(),
    location: locationSchema,
    startsAt: dateTimeSchema.optional(),
    endsAt: dateTimeSchema.optional().or(z.literal('')),
    allDay: z.coerce.boolean().optional(),
    inspectionId: uuidSchema.optional().or(z.literal('')),
    appealId: uuidSchema.optional().or(z.literal('')),
    version: z.number().int().positive(),
  })
  .superRefine(refineEvent);

export type UpdateCalendarEventInput = z.infer<typeof updateCalendarEventSchema>;

/** Параметры выборки календарного представления. */
export const calendarFeedQuerySchema = z
  .object({
    from: dateOnlySchema,
    to: dateOnlySchema,
    subjectCode: z.enum(SUBJECT_CODES).optional(),
    type: z.enum(CALENDAR_EVENT_TYPES).optional(),
  })
  .refine((value) => value.from <= value.to, {
    path: ['to'],
    message: 'Конец диапазона не может быть раньше начала',
  });

export type CalendarFeedQueryInput = z.infer<typeof calendarFeedQuerySchema>;
