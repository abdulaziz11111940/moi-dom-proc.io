import {
  APPEAL_KINDS,
  APPEAL_PRIORITIES,
  APPEAL_SOURCES,
  APPEAL_STATUSES,
  APPLICANT_TYPES,
  COMPLAINT_TARGETS,
  appealStatusRequiresReason,
  appealStatusRequiresTarget,
  SUBJECT_CODES,
} from '@femida/types';
import { z } from 'zod';

import { uuidSchema } from './common';

const topicSchema = z
  .string({ required_error: 'Укажите тему обращения' })
  .trim()
  .min(5, 'Тема должна содержать не менее 5 символов')
  .max(255, 'Тема не должна превышать 255 символов');

const applicantNameSchema = z
  .string()
  .trim()
  .max(191, 'Имя заявителя не должно превышать 191 символ');

/** Схема регистрации обращения. */
export const createAppealSchema = z
  .object({
    kind: z.enum(APPEAL_KINDS, {
      errorMap: () => ({ message: 'Выберите вид записи' }),
    }),
    subjectCode: z.enum(SUBJECT_CODES, {
      errorMap: () => ({ message: 'Выберите субъект' }),
    }),
    source: z.enum(APPEAL_SOURCES, {
      errorMap: () => ({ message: 'Выберите источник поступления' }),
    }),
    /** Предмет обжалования. Определяет подведомственность (статьи 2.4, 2.5, 2.9). */
    complaintTarget: z.enum(COMPLAINT_TARGETS).default('NONE'),
    priority: z.enum(APPEAL_PRIORITIES).default('NORMAL'),
    topic: topicSchema,
    summary: z
      .string({ required_error: 'Укажите краткое описание' })
      .trim()
      .min(10, 'Краткое описание должно содержать не менее 10 символов')
      .max(1000, 'Краткое описание не должно превышать 1000 символов'),
    fullText: z
      .string()
      .trim()
      .max(20000, 'Полный текст не должен превышать 20000 символов')
      .optional()
      .or(z.literal('')),
    category: z
      .string()
      .trim()
      .max(191, 'Категория не должна превышать 191 символ')
      .optional()
      .or(z.literal('')),
    isAnonymous: z.boolean().default(false),

    /** Сведения о заявителе. Статьи 1.3, 2.6 и 2.7 Регламента ГП-129. */
    applicantType: z.enum(APPLICANT_TYPES).default('CITIZEN'),
    applicantName: applicantNameSchema.optional().or(z.literal('')),
    applicantContact: z
      .string()
      .trim()
      .max(512, 'Контактные данные не должны превышать 512 символов')
      .optional()
      .or(z.literal('')),
    applicantAddress: z
      .string()
      .trim()
      .max(512, 'Почтовый адрес не должен превышать 512 символов')
      .optional()
      .or(z.literal('')),
    applicantPassport: z
      .string()
      .trim()
      .max(191, 'Паспортные данные не должны превышать 191 символ')
      .optional()
      .or(z.literal('')),

    /** Представитель заявителя. Статья 2.2 Регламента ГП-129. */
    representativeName: z
      .string()
      .trim()
      .max(191, 'ФИО представителя не должно превышать 191 символ')
      .optional()
      .or(z.literal('')),
    representativePassport: z
      .string()
      .trim()
      .max(191, 'Паспортные данные представителя не должны превышать 191 символ')
      .optional()
      .or(z.literal('')),
    representativeContract: z
      .string()
      .trim()
      .max(512, 'Реквизиты договора не должны превышать 512 символов')
      .optional()
      .or(z.literal('')),

    /** Момент поступления обращения. От него отсчитываются сроки. */
    receivedAt: z
      .string()
      .datetime({ message: 'Ожидается дата и время в формате ISO-8601' })
      .optional()
      .or(z.literal('')),
    responsibleId: uuidSchema.optional().or(z.literal('')),
    supervisorId: uuidSchema.optional().or(z.literal('')),
    /**
     * Контрольный срок. Если не указан, рассчитывается по Регламенту:
     * 48 часов с момента поступления (статья 3.1).
     */
    deadlineAt: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/u, 'Ожидается дата в формате ГГГГ-ММ-ДД')
      .optional()
      .or(z.literal('')),
    isConfidential: z.boolean().default(false),
    tags: z.array(z.string().trim().min(1).max(48)).max(12, 'Не более 12 тегов').default([]),
  })
  .refine((data) => data.isAnonymous || (data.applicantName ?? '').length >= 3, {
    path: ['applicantName'],
    message: 'Укажите заявителя или отметьте обращение как анонимное',
  });

export type CreateAppealInput = z.infer<typeof createAppealSchema>;

/** Схема изменения карточки. Все поля необязательны. */
export const updateAppealSchema = z.object({
  topic: topicSchema.optional(),
  summary: z.string().trim().min(10).max(1000).optional(),
  fullText: z.string().trim().max(20000).optional(),
  category: z.string().trim().max(191).optional(),
  priority: z.enum(APPEAL_PRIORITIES).optional(),
  applicantName: applicantNameSchema.optional(),
  applicantContact: z.string().trim().max(512).optional(),
  applicantAddress: z.string().trim().max(512).optional(),
  applicantPassport: z.string().trim().max(191).optional(),
  representativeName: z.string().trim().max(191).optional(),
  representativePassport: z.string().trim().max(191).optional(),
  representativeContract: z.string().trim().max(512).optional(),
  isConfidential: z.boolean().optional(),
  tags: z.array(z.string().trim().min(1).max(48)).max(12).optional(),
  resolution: z.string().trim().max(4000).optional(),
  /** Версия записи для оптимистической блокировки. */
  version: z.number().int().positive(),
});

export type UpdateAppealInput = z.infer<typeof updateAppealSchema>;

/**
 * Схема смены статуса.
 *
 * Решения по статье 3.1 Регламента должны быть мотивированными, поэтому для
 * них основание обязательно. При передаче обращения указывается орган,
 * при приобщении — обращение, к которому приобщается запись.
 */
export const changeAppealStatusSchema = z
  .object({
    status: z.enum(APPEAL_STATUSES, {
      errorMap: () => ({ message: 'Выберите статус' }),
    }),
    reason: z
      .string()
      .trim()
      .max(1000, 'Основание не должно превышать 1000 символов')
      .optional()
      .or(z.literal('')),
    /** Орган, в который передаётся обращение. */
    transferredTo: z
      .string()
      .trim()
      .max(255, 'Наименование органа не должно превышать 255 символов')
      .optional()
      .or(z.literal('')),
    /** Обращение, к которому приобщается запись. */
    mergedIntoId: uuidSchema.optional().or(z.literal('')),
    /**
     * Перевод на произвольный этап в обход установленного порядка.
     * Доступен начиная с роли старшего помощника и требует основания.
     */
    force: z.boolean().default(false),
    version: z.number().int().positive(),
  })
  .superRefine((data, ctx) => {
    if (data.force && (data.reason ?? '').trim().length < 10) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['reason'],
        message:
          'Перевод вне установленного порядка требует основания не короче 10 символов',
      });
    }

    if (appealStatusRequiresReason(data.status) && (data.reason ?? '').trim().length < 10) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['reason'],
        message: 'Решение должно быть мотивированным: укажите основание не короче 10 символов',
      });
    }

    if (appealStatusRequiresTarget(data.status) && (data.transferredTo ?? '').trim().length < 3) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['transferredTo'],
        message: 'Укажите орган, в который направляется обращение',
      });
    }

    if (data.status === 'MERGED' && !data.mergedIntoId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['mergedIntoId'],
        message: 'Укажите обращение, к которому приобщается запись',
      });
    }
  });

export type ChangeAppealStatusInput = z.infer<typeof changeAppealStatusSchema>;

/** Схема назначения ответственного и надзирающего прокурора. */
export const assignAppealSchema = z
  .object({
    responsibleId: uuidSchema.nullable().optional(),
    supervisorId: uuidSchema.nullable().optional(),
    version: z.number().int().positive(),
  })
  .refine(
    (data) => data.responsibleId !== undefined || data.supervisorId !== undefined,
    'Укажите ответственного или надзирающего прокурора',
  );

export type AssignAppealInput = z.infer<typeof assignAppealSchema>;

/** Схема продления контрольного срока. Основание обязательно. */
export const extendAppealDeadlineSchema = z.object({
  deadlineAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/u, 'Ожидается дата в формате ГГГГ-ММ-ДД'),
  reason: z
    .string({ required_error: 'Укажите основание продления' })
    .trim()
    .min(10, 'Основание должно содержать не менее 10 символов')
    .max(1000, 'Основание не должно превышать 1000 символов'),
  version: z.number().int().positive(),
});

export type ExtendAppealDeadlineInput = z.infer<typeof extendAppealDeadlineSchema>;

/**
 * Схема обжалования отказа в принятии обращения.
 * Статья 2.9 Регламента ГП-129.
 */
export const challengeAppealSchema = z.object({
  reason: z
    .string({ required_error: 'Укажите доводы жалобы' })
    .trim()
    .min(20, 'Доводы жалобы должны содержать не менее 20 символов')
    .max(4000, 'Доводы жалобы не должны превышать 4000 символов'),
});

export type ChallengeAppealInput = z.infer<typeof challengeAppealSchema>;

/** Схема комментария к обращению. */
export const appealCommentSchema = z.object({
  body: z
    .string({ required_error: 'Введите текст комментария' })
    .trim()
    .min(2, 'Комментарий слишком короткий')
    .max(4000, 'Комментарий не должен превышать 4000 символов'),
  isServiceNote: z.boolean().default(false),
});

export type AppealCommentInput = z.infer<typeof appealCommentSchema>;

/**
 * Логическое значение в строке запроса.
 * `z.coerce.boolean()` здесь неприменим: он превращает строку «false» в `true`.
 */
const queryBoolean = z
  .union([z.boolean(), z.string()])
  .transform((value) => (typeof value === 'boolean' ? value : value.toLowerCase() === 'true'));

/**
 * Значение, которое в строке запроса может быть указано один или несколько раз.
 * Одиночное значение приводится к массиву.
 */
function queryArray<T extends z.ZodTypeAny>(schema: T): z.ZodType<z.infer<T>[]> {
  return z
    .union([schema, z.array(schema)])
    .transform((value) => (Array.isArray(value) ? value : [value])) as z.ZodType<z.infer<T>[]>;
}

/** Параметры выборки реестра. */
export const appealsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(5).max(100).default(20),
  sortBy: z
    .enum(['registeredAt', 'deadlineAt', 'status', 'priority', 'regNumber'])
    .default('registeredAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().trim().max(191).optional(),
  status: queryArray(z.enum(APPEAL_STATUSES)).optional(),
  kind: z.enum(APPEAL_KINDS).optional(),
  priority: z.enum(APPEAL_PRIORITIES).optional(),
  subjectCode: z.enum(SUBJECT_CODES).optional(),
  responsibleId: uuidSchema.optional(),
  /** Обращения, где сотрудник является надзирающим прокурором. */
  supervisorId: uuidSchema.optional(),
  /** Только просроченные записи. */
  overdueOnly: queryBoolean.optional(),
  /** Только записи в работе (не завершённые). */
  activeOnly: queryBoolean.optional(),
  /** Только зарегистрированные с нарушением 24-часового срока. */
  registrationOverdueOnly: queryBoolean.optional(),
});

export type AppealsQueryInput = z.infer<typeof appealsQuerySchema>;
