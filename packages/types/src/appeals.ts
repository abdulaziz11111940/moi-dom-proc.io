/**
 * Модуль обращений и жалоб.
 *
 * Перечни статусов и сроки соответствуют Регламенту рассмотрения обращений и
 * приёма граждан в органах прокуратуры (приказ Генерального прокурора
 * № ГП-129 от 20 марта 2026 г.). Ссылки на статьи приведены в комментариях.
 *
 * Сопоставление со значениями действующей (легаси) системы —
 * `LEGACY_APPEAL_STATUS`, см. `infrastructure/legacy/README.md`.
 */

import { type ComplaintTarget, type JurisdictionLevel } from './jurisdiction';
import { type Role } from './roles';

/** Тип заявителя. Статья 1.3 Регламента. */
export const APPLICANT_TYPES = ['CITIZEN', 'ASSOCIATION', 'LEGAL_ENTITY'] as const;
export type ApplicantType = (typeof APPLICANT_TYPES)[number];

export const APPLICANT_TYPE_LABEL: Record<ApplicantType, string> = {
  CITIZEN: 'Гражданин',
  ASSOCIATION: 'Объединение граждан',
  LEGAL_ENTITY: 'Юридическое лицо',
};

/** Вид записи реестра. */
export const APPEAL_KINDS = ['APPEAL', 'COMPLAINT', 'REQUEST'] as const;
export type AppealKind = (typeof APPEAL_KINDS)[number];

export const APPEAL_KIND_LABEL: Record<AppealKind, string> = {
  APPEAL: 'Обращение',
  COMPLAINT: 'Жалоба',
  REQUEST: 'Заявление',
};

/** Короткое обозначение вида для регистрационного номера. */
export const APPEAL_KIND_PREFIX: Record<AppealKind, string> = {
  APPEAL: 'ОБР',
  COMPLAINT: 'ЖАЛ',
  REQUEST: 'ЗАЯ',
};

/** Источник поступления. */
export const APPEAL_SOURCES = [
  'FORUM',
  'WRITTEN',
  'ORAL',
  'TRANSFER',
  'OTHER',
] as const;
export type AppealSource = (typeof APPEAL_SOURCES)[number];

export const APPEAL_SOURCE_LABEL: Record<AppealSource, string> = {
  FORUM: 'Форум',
  WRITTEN: 'Письменное обращение',
  ORAL: 'Устное обращение',
  TRANSFER: 'Передано из другого органа',
  OTHER: 'Иной источник',
};

/**
 * Приоритет рассмотрения.
 *
 * Определяет очерёдность работы, но НЕ влияет на контрольный срок: Регламент
 * устанавливает единый срок для всех обращений (статьи 3.1 и 3.8).
 */
export const APPEAL_PRIORITIES = ['LOW', 'NORMAL', 'HIGH', 'CRITICAL'] as const;
export type AppealPriority = (typeof APPEAL_PRIORITIES)[number];

export const APPEAL_PRIORITY_LABEL: Record<AppealPriority, string> = {
  LOW: 'Низкий',
  NORMAL: 'Обычный',
  HIGH: 'Высокий',
  CRITICAL: 'Критический',
};

/**
 * Срок регистрации обращения — 24 часа с момента поступления.
 * Статьи 2.1, 2.3 и 2.7 Регламента.
 */
export const APPEAL_REGISTRATION_DEADLINE_HOURS = 24;

/**
 * Срок принятия мотивированного решения — 48 часов с момента поступления.
 * Статьи 3.1 и 3.8 Регламента.
 */
export const APPEAL_DECISION_DEADLINE_HOURS = 48;

/**
 * Статусы рассмотрения.
 *
 * Статусы `REJECTED`, `TRANSFERRED_UP`, `TRANSFERRED_EXTERNAL`, `TERMINATED`,
 * `MERGED` и `RETURNED` соответствуют решениям, перечисленным в статье 3.1
 * Регламента.
 */
export const APPEAL_STATUSES = [
  'DRAFT',
  'REGISTERED',
  'IN_REVIEW',
  'ASSIGNED',
  'IN_PROGRESS',
  'WAITING_INFORMATION',
  'UNDER_CONTROL',
  'COMPLETED',
  'CLOSED',
  'REJECTED',
  'TRANSFERRED_UP',
  'TRANSFERRED_EXTERNAL',
  'TERMINATED',
  'MERGED',
  'RETURNED',
  'ARCHIVED',
] as const;
export type AppealStatus = (typeof APPEAL_STATUSES)[number];

export const APPEAL_STATUS_LABEL: Record<AppealStatus, string> = {
  DRAFT: 'Черновик',
  REGISTERED: 'Зарегистрировано',
  IN_REVIEW: 'На рассмотрении',
  ASSIGNED: 'Принято к разрешению',
  IN_PROGRESS: 'В работе',
  WAITING_INFORMATION: 'Ожидание сведений',
  UNDER_CONTROL: 'На контроле',
  COMPLETED: 'Рассмотрено',
  CLOSED: 'Закрыто',
  REJECTED: 'Оставлено без разрешения',
  TRANSFERRED_UP: 'Передано в вышестоящую прокуратуру',
  TRANSFERRED_EXTERNAL: 'Направлено в другой орган',
  TERMINATED: 'Рассмотрение прекращено',
  MERGED: 'Приобщено к ранее поступившему',
  RETURNED: 'Возвращено заявителю',
  ARCHIVED: 'В архиве',
};

/**
 * Решения, принимаемые по обращению в соответствии со статьёй 3.1 Регламента.
 * Используется формой принятия решения: остальные статусы отражают ход работы.
 */
export const APPEAL_DECISIONS: readonly AppealStatus[] = [
  'ASSIGNED',
  'REJECTED',
  'TRANSFERRED_UP',
  'TRANSFERRED_EXTERNAL',
  'TERMINATED',
  'MERGED',
  'RETURNED',
];

/**
 * Статусы, требующие обязательного указания основания.
 * Немотивированное решение противоречит статье 3.1 Регламента.
 */
export const APPEAL_STATUSES_REQUIRING_REASON: readonly AppealStatus[] = [
  'REJECTED',
  'TRANSFERRED_UP',
  'TRANSFERRED_EXTERNAL',
  'TERMINATED',
  'MERGED',
  'RETURNED',
];

/** Статусы, требующие указания органа, в который направлено обращение. */
export const APPEAL_STATUSES_REQUIRING_TARGET: readonly AppealStatus[] = [
  'TRANSFERRED_UP',
  'TRANSFERRED_EXTERNAL',
];

/**
 * Допустимые переходы между статусами.
 *
 * Переход, отсутствующий в таблице, отклоняется сервером: произвольная смена
 * статуса недопустима, иначе история рассмотрения теряет смысл.
 *
 * Решения по статье 3.1 принимаются на этапах `REGISTERED` и `IN_REVIEW`.
 * Согласно статье 5.3 любое завершённое рассмотрение направляется в архив.
 */
export const APPEAL_STATUS_TRANSITIONS: Record<AppealStatus, readonly AppealStatus[]> = {
  DRAFT: ['REGISTERED'],
  REGISTERED: [
    'IN_REVIEW',
    'ASSIGNED',
    'REJECTED',
    'TRANSFERRED_UP',
    'TRANSFERRED_EXTERNAL',
    'TERMINATED',
    'MERGED',
    'RETURNED',
  ],
  IN_REVIEW: [
    'ASSIGNED',
    'REJECTED',
    'TRANSFERRED_UP',
    'TRANSFERRED_EXTERNAL',
    'TERMINATED',
    'MERGED',
    'RETURNED',
    'WAITING_INFORMATION',
  ],
  ASSIGNED: ['IN_PROGRESS', 'WAITING_INFORMATION', 'UNDER_CONTROL', 'TERMINATED'],
  IN_PROGRESS: ['WAITING_INFORMATION', 'UNDER_CONTROL', 'COMPLETED', 'TERMINATED'],
  WAITING_INFORMATION: ['IN_PROGRESS', 'UNDER_CONTROL', 'TERMINATED'],
  UNDER_CONTROL: ['IN_PROGRESS', 'COMPLETED', 'TERMINATED'],
  COMPLETED: ['CLOSED', 'UNDER_CONTROL'],
  CLOSED: ['ARCHIVED'],
  REJECTED: ['ARCHIVED'],
  TRANSFERRED_UP: ['ARCHIVED'],
  TRANSFERRED_EXTERNAL: ['ARCHIVED'],
  TERMINATED: ['ARCHIVED'],
  MERGED: ['ARCHIVED'],
  RETURNED: ['ARCHIVED'],
  ARCHIVED: [],
};

/**
 * Роль, начиная с которой допускается перевод обращения на произвольный этап
 * в обход установленного порядка — вперёд или назад.
 *
 * Такой перевод не отменяет содержательных требований: обязательное основание
 * решения, указание органа при передаче, наличие ответственного для работы и
 * видеофиксации для устного обращения продолжают проверяться.
 */
export const APPEAL_FORCE_TRANSITION_MIN_ROLE: Role = 'SENIOR_ASSISTANT';

/** Статусы, при которых рассмотрение считается завершённым. */
export const APPEAL_FINAL_STATUSES: readonly AppealStatus[] = [
  'COMPLETED',
  'CLOSED',
  'REJECTED',
  'TRANSFERRED_UP',
  'TRANSFERRED_EXTERNAL',
  'TERMINATED',
  'MERGED',
  'RETURNED',
  'ARCHIVED',
];

export function isAppealFinalStatus(status: AppealStatus): boolean {
  return APPEAL_FINAL_STATUSES.includes(status);
}

export function canTransitionAppealStatus(from: AppealStatus, to: AppealStatus): boolean {
  return APPEAL_STATUS_TRANSITIONS[from].includes(to);
}

export function appealStatusRequiresReason(status: AppealStatus): boolean {
  return APPEAL_STATUSES_REQUIRING_REASON.includes(status);
}

export function appealStatusRequiresTarget(status: AppealStatus): boolean {
  return APPEAL_STATUSES_REQUIRING_TARGET.includes(status);
}

/**
 * Контрольный срок принятия решения: 48 часов с момента поступления.
 * Статья 3.1 Регламента.
 */
export function calculateAppealDeadline(receivedAt: Date): Date {
  return new Date(receivedAt.getTime() + APPEAL_DECISION_DEADLINE_HOURS * 60 * 60 * 1000);
}

/**
 * Предельный срок регистрации: 24 часа с момента поступления.
 * Статья 2.3 Регламента.
 */
export function calculateRegistrationDeadline(receivedAt: Date): Date {
  return new Date(receivedAt.getTime() + APPEAL_REGISTRATION_DEADLINE_HOURS * 60 * 60 * 1000);
}

/** Статусы обращений действующей (легаси) системы. */
export const LEGACY_APPEAL_STATUS: Readonly<Record<string, AppealStatus>> = {
  зарегистрировано: 'REGISTERED',
  'на рассмотрении': 'IN_REVIEW',
  'в работе': 'IN_PROGRESS',
  'ответ направлен': 'COMPLETED',
  закрыто: 'CLOSED',
};

// ---------------------------------------------------------------------------
// Контракты API
// ---------------------------------------------------------------------------

export interface AppealPersonRef {
  id: string;
  fullName: string;
  position: string;
}

/** Строка реестра обращений. */
export interface AppealListItemDto {
  id: string;
  regNumber: string;
  kind: AppealKind;
  topic: string;
  status: AppealStatus;
  priority: AppealPriority;
  source: AppealSource;
  subject: { code: string; name: string; shortName: string };
  applicantName: string;
  isAnonymous: boolean;
  responsible: AppealPersonRef | null;
  /** Момент поступления обращения в органы прокуратуры. */
  receivedAt: string;
  /** Момент регистрации в системе. */
  registeredAt: string;
  deadlineAt: string | null;
  completedAt: string | null;
  /** Признак просрочки, рассчитанный на сервере. */
  isOverdue: boolean;
  /** Часов до контрольного срока; отрицательное значение — просрочка. */
  hoursUntilDeadline: number | null;
  /** Регистрация выполнена позже 24 часов с момента поступления (статья 2.3). */
  isRegistrationOverdue: boolean;
  /** Пометка подведомственности: кто обязан рассмотреть обращение. */
  jurisdictionLevel: JurisdictionLevel;
  isDemo: boolean;
}

export interface AppealCommentDto {
  id: string;
  body: string;
  isServiceNote: boolean;
  author: AppealPersonRef | null;
  createdAt: string;
}

export interface AppealStatusHistoryDto {
  id: string;
  fromStatus: AppealStatus | null;
  toStatus: AppealStatus;
  reason: string | null;
  changedBy: AppealPersonRef | null;
  createdAt: string;
  /** Перевод выполнен в обход установленного порядка рассмотрения. */
  isForced: boolean;
}

/** Краткая ссылка на другое обращение. */
export interface AppealRef {
  id: string;
  regNumber: string;
  topic: string;
}

/** Карточка обращения. */
export interface AppealDto extends AppealListItemDto {
  summary: string;
  fullText: string;
  category: string | null;

  /** Сведения о заявителе. Статьи 1.3, 2.6 и 2.7 Регламента. */
  applicantType: ApplicantType;
  applicantContact: string | null;
  applicantAddress: string | null;
  /**
   * Паспортные данные заявителя.
   * Возвращаются только участникам рассмотрения и руководству субъекта.
   */
  applicantPassport: string | null;

  /** Представитель заявителя. Статья 2.2 Регламента. */
  representativeName: string | null;
  representativePassport: string | null;
  representativeContract: string | null;

  supervisor: AppealPersonRef | null;
  createdBy: AppealPersonRef | null;
  registrationDeadlineAt: string | null;
  startedAt: string | null;
  deadlineExtendedFrom: string | null;
  deadlineExtensionReason: string | null;
  resolution: string | null;

  /** Предмет обжалования, определяющий подведомственность. */
  complaintTarget: ComplaintTarget;

  /** Обжалуемое обращение, если данная запись является жалобой (статья 2.9). */
  challengedAppeal: AppealRef | null;
  /** Жалоба, поданная на решение по данному обращению. */
  challenge: AppealRef | null;

  /** Орган, в который передано обращение (статусы TRANSFERRED_*). */
  transferredTo: string | null;
  /** Обращение, к которому приобщена запись (статус MERGED). */
  mergedInto: AppealRef | null;
  /** Обращения, приобщённые к данному. */
  mergedAppeals: AppealRef[];

  isConfidential: boolean;
  tags: string[];
  version: number;
  createdAt: string;
  updatedAt: string;
  comments: AppealCommentDto[];
  statusHistory: AppealStatusHistoryDto[];
  /** Статусы, в которые запись может быть переведена из текущего. */
  allowedTransitions: AppealStatus[];
  /**
   * Доступен ли текущему пользователю перевод на произвольный этап
   * в обход установленного порядка.
   */
  canForceTransition: boolean;
}

/** Сводка реестра для карточек над таблицей. */
export interface AppealSummaryDto {
  total: number;
  inWork: number;
  overdue: number;
  /** До контрольного срока осталось менее 12 часов. */
  dueSoon: number;
  completed: number;
  /** Зарегистрированы с нарушением 24-часового срока (статья 2.3). */
  registrationOverdue: number;
}

/**
 * Нагрузка одного сотрудника: что на нём распределено.
 *
 * Учитываются только незавершённые обращения — завершённые нагрузки
 * не создают.
 */
export interface AppealWorkloadItemDto {
  employee: AppealPersonRef & {
    rank: string | null;
    subjectCode: string;
    subjectShortName: string;
    status: string;
  };
  /** Всего незавершённых обращений, где сотрудник — исполнитель. */
  total: number;
  /** Разбивка по статусам рассмотрения. */
  byStatus: Record<AppealStatus, number>;
  /** Из них просрочено. */
  overdue: number;
  /** Из них до контрольного срока осталось менее 12 часов. */
  dueSoon: number;
  /** Обращения, где сотрудник является надзирающим прокурором. */
  supervising: number;
  /** Ближайший контрольный срок среди незавершённых обращений. */
  nearestDeadlineAt: string | null;
}

/** Сводка распределения обращений между сотрудниками. */
export interface AppealWorkloadDto {
  items: AppealWorkloadItemDto[];
  /** Незавершённые обращения без назначенного исполнителя. */
  unassigned: number;
  /** Из нераспределённых — просрочено. */
  unassignedOverdue: number;
  /** Всего незавершённых обращений в области видимости. */
  totalActive: number;
  /** Субъекты, попавшие в выборку. */
  subjectCodes: string[];
  generatedAt: string;
}

/** Ответ реестра обращений. */
export interface AppealListResponse {
  items: AppealListItemDto[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  summary: AppealSummaryDto;
}
