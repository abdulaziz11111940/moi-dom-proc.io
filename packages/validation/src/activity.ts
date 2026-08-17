import { ACTIVITY_EVENT_TYPES, DECISION_OUTCOMES, getActivityEventKind, SUBJECT_CODES } from '@femida/types';
import { z } from 'zod';

const TARGET_ID_PATTERN = /^\d{2,3}-\d{3}$/u;

const linkSchema = z.string().trim().min(1).max(1024, 'Ссылка не должна превышать 1024 символа');

const baseActivityRecordSchema = z.object({
  type: z.enum(ACTIVITY_EVENT_TYPES, { errorMap: () => ({ message: 'Выберите тип события' }) }),
  eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/u, 'Ожидается дата в формате ГГГГ-ММ-ДД'),
  subjectCode: z.enum(SUBJECT_CODES, { errorMap: () => ({ message: 'Выберите субъект' }) }),
  factionId: z.string().uuid('Выберите организацию'),
  links: z.array(linkSchema).min(1, 'Добавьте минимум одно доказательство: ссылку или скриншот'),

  // person-блок
  targetFullName: z.string().trim().max(191).optional(),
  targetId: z.string().trim().max(32).optional(),
  targetPosition: z.string().trim().max(191).optional(),
  reason: z.string().trim().max(2000).optional(),
  decisionOutcome: z.enum(DECISION_OUTCOMES).optional(),
  measureLabel: z.string().trim().max(500).optional(),
  includeInDossier: z.boolean().optional(),

  // visit-блок
  topic: z.string().trim().max(191).optional(),
  description: z.string().trim().max(2000).optional(),
  participantUserIds: z.array(z.string().uuid()).optional(),

  // news-блок
  headline: z.string().trim().max(191).optional(),
  newsBody: z.string().trim().max(4000).optional(),

  // duty-блок
  dutyTimeFrom: z.string().trim().max(16).optional(),
  dutyTimeTo: z.string().trim().max(16).optional(),
  dutyDescription: z.string().trim().max(2000).optional(),
});

/**
 * Требования к полям зависят от типа события — повторяет
 * `validatePilotActivityForm` действующей системы: у каждого «вида» записи
 * (person/visit/news/duty) свой обязательный набор полей.
 */
function withActivityRecordRules<T extends z.ZodTypeAny>(schema: T) {
  return schema.superRefine((data, ctx) => {
    const value = data as z.infer<typeof baseActivityRecordSchema>;
    const kind = getActivityEventKind(value.type);
    const fail = (path: string, message: string) => ctx.addIssue({ code: z.ZodIssueCode.custom, path: [path], message });

    if (kind === 'VISIT') {
      if (!value.topic?.trim()) fail('topic', 'Укажите тему официального визита');
      if (!value.participantUserIds?.length) fail('participantUserIds', 'Выберите минимум одного участника от прокуратуры');
      if (!value.description?.trim()) fail('description', 'Заполните описание или цель мероприятия');
      return;
    }

    if (kind === 'NEWS') {
      if (!value.headline?.trim()) fail('headline', 'Укажите заголовок новости');
      return;
    }

    if (kind === 'DUTY') {
      if (!value.dutyTimeFrom?.trim()) fail('dutyTimeFrom', 'Укажите время начала дежурства');
      if (!value.dutyTimeTo?.trim()) fail('dutyTimeTo', 'Укажите время окончания дежурства');
      return;
    }

    // PERSON
    if (!value.targetFullName?.trim()) fail('targetFullName', 'Укажите ФИО лица, в отношении которого внесено событие');
    if (!value.targetId?.trim()) {
      fail('targetId', 'Укажите ID лица');
    } else if (!TARGET_ID_PATTERN.test(value.targetId.trim())) {
      fail('targetId', 'ID должен быть в формате 000-000 или 00-000');
    }
    if (!value.targetPosition?.trim()) fail('targetPosition', 'Укажите звание или должность лица');
    if (!value.reason?.trim()) fail('reason', 'Укажите причину события');

    if (value.type === 'DECISION') {
      if (!value.decisionOutcome) fail('decisionOutcome', 'Выберите исход вынесенного решения');
      if (!value.measureLabel?.trim()) fail('measureLabel', 'Укажите меру наказания или текст освобождения');
    }
    if (value.type === 'DISCIPLINARY' && !value.measureLabel?.trim()) {
      fail('measureLabel', 'Укажите конкретный вид дисциплинарного взыскания');
    }
  });
}

export const createActivityRecordSchema = withActivityRecordRules(baseActivityRecordSchema);
export type CreateActivityRecordInput = z.infer<typeof baseActivityRecordSchema>;

export const updateActivityRecordSchema = createActivityRecordSchema;
export type UpdateActivityRecordInput = CreateActivityRecordInput;

/** Параметры выборки журнала. */
export const activityQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(5).max(100).default(30),
  subjectCode: z.enum(SUBJECT_CODES).optional(),
  type: z.enum(ACTIVITY_EVENT_TYPES).optional(),
  factionId: z.string().uuid().optional(),
  evidence: z.enum(['all', 'with', 'missing']).default('all'),
  /** Помесячный период вида ГГГГ-ММ; по умолчанию — текущий месяц. */
  period: z.string().regex(/^\d{4}-\d{2}$/u).optional(),
  search: z.string().trim().max(191).optional(),
});

export type ActivityQueryInput = z.infer<typeof activityQuerySchema>;
