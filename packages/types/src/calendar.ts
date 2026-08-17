/**
 * Календарь служебных мероприятий.
 *
 * Модуль хранит собственные события (совещания, аттестации, дежурства и прочие
 * мероприятия) и дополняет их в представлениях сроками, которые собираются из
 * других модулей на лету: датами проведения проверок и контрольными сроками
 * обращений. Собственные события можно привязать к проверке или обращению.
 */
import { type Role } from './roles';

export const CALENDAR_EVENT_TYPES = [
  'MEETING',
  'INSPECTION',
  'ATTESTATION',
  'DEADLINE',
  'DUTY',
  'EVENT',
  'OTHER',
] as const;

export type CalendarEventType = (typeof CALENDAR_EVENT_TYPES)[number];

export const CALENDAR_EVENT_TYPE_LABEL: Record<CalendarEventType, string> = {
  MEETING: 'Совещание',
  INSPECTION: 'Проверка',
  ATTESTATION: 'Аттестация',
  DEADLINE: 'Срок',
  DUTY: 'Дежурство',
  EVENT: 'Мероприятие',
  OTHER: 'Иное',
};

/**
 * Типы, которые сотрудник заводит вручную.
 *
 * Проверки и сроки обращений попадают в календарь автоматически из своих
 * модулей, поэтому в форме создания их не предлагаем во избежание дублей.
 */
export const CALENDAR_CREATABLE_EVENT_TYPES: readonly CalendarEventType[] = [
  'MEETING',
  'ATTESTATION',
  'DUTY',
  'EVENT',
  'DEADLINE',
  'OTHER',
];

export const CALENDAR_EVENT_VISIBILITIES = ['SUBJECT', 'PERSONAL'] as const;
export type CalendarEventVisibility = (typeof CALENDAR_EVENT_VISIBILITIES)[number];

export const CALENDAR_EVENT_VISIBILITY_LABEL: Record<CalendarEventVisibility, string> = {
  SUBJECT: 'Виден субъекту',
  PERSONAL: 'Личное',
};

/** Источник записи в объединённом представлении календаря. */
export const CALENDAR_ENTRY_SOURCES = ['EVENT', 'INSPECTION', 'APPEAL'] as const;
export type CalendarEntrySource = (typeof CALENDAR_ENTRY_SOURCES)[number];

/**
 * Роль, начиная с которой можно заводить события, видимые всему субъекту.
 * Личные события доступны любому сотруднику.
 */
export const CALENDAR_SUBJECT_EVENT_MIN_ROLE: Role = 'SENIOR_ASSISTANT';

// ---------------------------------------------------------------------------
// Контракты API
// ---------------------------------------------------------------------------

export interface CalendarPersonRef {
  id: string;
  fullName: string;
  position: string;
}

export interface CalendarSubjectRef {
  code: string;
  name: string;
  shortName: string;
}

/** Привязка события к проверке или обращению. */
export interface CalendarEventLink {
  kind: 'INSPECTION' | 'APPEAL';
  id: string;
  /** Человекочитаемая подпись, напр. рег. номер. */
  label: string;
  /** Адрес карточки связанной сущности. */
  href: string;
}

/** Карточка события — результат чтения и операций записи. */
export interface CalendarEventDto {
  id: string;
  title: string;
  description: string | null;
  type: CalendarEventType;
  visibility: CalendarEventVisibility;
  subject: CalendarSubjectRef;
  location: string | null;
  startsAt: string;
  endsAt: string | null;
  allDay: boolean;
  link: CalendarEventLink | null;
  createdBy: CalendarPersonRef | null;
  version: number;
  createdAt: string;
  updatedAt: string;
  permissions: {
    canEdit: boolean;
    canDelete: boolean;
  };
}

/**
 * Запись объединённого представления календаря.
 *
 * Для `source: 'EVENT'` это собственное событие модуля; для `INSPECTION` и
 * `APPEAL` — производная запись из соответствующего модуля (только чтение),
 * ведущая по `href` на карточку источника.
 */
export interface CalendarEntryDto {
  /** Стабильный ключ строки вида `EVENT:<id>`. */
  key: string;
  source: CalendarEntrySource;
  id: string;
  type: CalendarEventType;
  title: string;
  /** Дополнительная строка: рег. номер, тип проверки и т. п. */
  subtitle: string | null;
  startsAt: string;
  endsAt: string | null;
  allDay: boolean;
  subject: CalendarSubjectRef;
  location: string | null;
  /** Ссылка для перехода к источнику (для `EVENT` — пусто, открывается карточка события). */
  href: string | null;
  /** Может ли текущий пользователь редактировать запись (только для собственных событий). */
  canEdit: boolean;
}

export interface CalendarFeedResponse {
  entries: CalendarEntryDto[];
  /** Границы выборки в ISO (полуинтервал [from, to)). */
  range: { from: string; to: string };
  /** Доступно ли текущему пользователю создание событий. */
  canCreate: boolean;
}
