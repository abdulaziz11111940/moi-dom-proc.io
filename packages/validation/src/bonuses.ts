import { BONUS_SETTINGS_DEFAULTS } from '@femida/types';
import { z } from 'zod';

/** Параметры выборки реестра премий. */
export const bonusQuerySchema = z.object({
  subject: z.string().trim().max(191).optional(),
  status: z.string().trim().max(64).optional(),
  /** Только премии, выплачиваемые за счёт округа. */
  subjectPayoutOnly: z
    .union([z.boolean(), z.literal('true'), z.literal('false')])
    .transform((value) => value === true || value === 'true')
    .optional()
    .default(false),
  /** Только те, по которым отчёт о выплате ещё не представлен. */
  awaitingPayoutOnly: z
    .union([z.boolean(), z.literal('true'), z.literal('false')])
    .transform((value) => value === true || value === 'true')
    .optional()
    .default(false),
  search: z.string().trim().max(191).optional(),
});

export type BonusQueryInput = z.infer<typeof bonusQuerySchema>;

/**
 * Отчёт о выплате премии.
 * Сам файл проверяется отдельно: его размер и тип схемой не описываются.
 */
export const bonusPayoutReportSchema = z.object({
  comment: z
    .string()
    .trim()
    .max(1000, 'Комментарий не должен превышать 1000 символов')
    .optional()
    .or(z.literal('')),
});

export type BonusPayoutReportInput = z.infer<typeof bonusPayoutReportSchema>;

/**
 * Настройки премирования.
 *
 * Все поля необязательны: недостающие добираются из значений по умолчанию при
 * нормализации, как в действующей системе.
 */
export const bonusSettingsSchema = z.object({
  baseAmount: z
    .number()
    .int('Базовая сумма должна быть целым числом')
    .min(0, 'Базовая сумма не может быть отрицательной')
    .max(1_000_000_000, 'Слишком большая базовая сумма')
    .optional(),
  maxMultiplier: z
    .number()
    .min(0, 'Коэффициент не может быть отрицательным')
    .max(100, 'Слишком большой коэффициент')
    .optional(),
  approvalRequired: z.boolean().optional(),
  payPeriod: z.string().trim().max(32).optional(),
  periodStartDay: z
    .number()
    .int()
    .min(1, 'День начала периода — от 1 до 28')
    .max(28, 'День начала периода — от 1 до 28')
    .optional(),
  reportDeadlineDay: z
    .number()
    .int()
    .min(1, 'День отчёта — от 1 до 31')
    .max(31, 'День отчёта — от 1 до 31')
    .optional(),
  reportDeadlineTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/u, 'Ожидается время в формате ЧЧ:ММ')
    .optional(),
  // Настройки режима технических работ хранятся в этом же документе —
  // так устроена действующая система.
  maintenanceEnabled: z.boolean().optional(),
  maintenanceGif: z.string().trim().max(255).optional(),
  maintenanceScheduledAt: z.string().trim().max(64).optional(),
  maintenanceAnnouncement: z.string().trim().max(1000).optional(),
  maintenanceActivatedAt: z.string().trim().max(64).optional(),
  /** Версия документа для оптимистической блокировки. */
  version: z.number().int().min(0).optional(),
});

export type BonusSettingsInput = z.infer<typeof bonusSettingsSchema>;

/** Перечень полей настроек — используется при отсечении посторонних значений. */
export const BONUS_SETTINGS_FIELDS = Object.keys(BONUS_SETTINGS_DEFAULTS);

/**
 * Назначение премии сотруднику (направление на согласование).
 *
 * Сумма вычисляется на сервере как базовая × коэффициент; клиент передаёт
 * базовую сумму и коэффициент, но окончательное значение сервер рассчитывает
 * сам, чтобы не доверять сумму из запроса.
 */
export const assignBonusSchema = z.object({
  recipientId: z
    .string({ required_error: 'Выберите получателя' })
    .trim()
    .min(1, 'Выберите получателя'),
  baseAmount: z
    .number({ required_error: 'Укажите базовую сумму' })
    .int('Базовая сумма должна быть целым числом')
    .min(0, 'Базовая сумма не может быть отрицательной')
    .max(1_000_000_000, 'Слишком большая базовая сумма'),
  // Коэффициент по Положению: от 0.25 до 2 с шагом 0.25.
  coefficient: z
    .number({ required_error: 'Укажите коэффициент' })
    .min(0.25, 'Коэффициент не может быть меньше 0.25')
    .max(2, 'Коэффициент не может превышать 2')
    .refine((value) => Math.abs(value / 0.25 - Math.round(value / 0.25)) < 1e-9, {
      message: 'Коэффициент задаётся с шагом 0.25',
    }),
  reason: z
    .string({ required_error: 'Укажите основание' })
    .trim()
    .min(5, 'Основание должно содержать не менее 5 символов')
    .max(500, 'Основание не должно превышать 500 символов'),
  comment: z.string().trim().max(1000, 'Комментарий не должен превышать 1000 символов').optional().or(z.literal('')),
});

export type AssignBonusInput = z.infer<typeof assignBonusSchema>;
