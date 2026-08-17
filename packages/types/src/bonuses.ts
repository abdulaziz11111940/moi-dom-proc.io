/**
 * Премирование.
 *
 * Модуль работает с теми же структурами, что и действующая система: премии и
 * настройки хранятся двумя ключами состояния приложения в виде JSON, без
 * разбора на реляционные таблицы. Правила ниже воспроизводят поведение
 * действующей системы дословно — от этого зависит, совпадут ли решения по
 * уже существующим записям.
 */
import { type Role } from './roles';

/** Роли действующей системы. С ролями ЕИАС «Фемида» не совпадают. */
export const LEGACY_BONUS_ROLES = [
  'STAFF',
  'SENIOR_STAFF',
  'USP',
  'BOSS',
  'FEDERAL',
  'ADMIN',
] as const;

export type LegacyBonusRole = (typeof LEGACY_BONUS_ROLES)[number];

/**
 * Роли, которым разрешено изменять премии.
 *
 * Перечень задан списком, а не порогом «не ниже чем»: УСБ стоит в иерархии
 * выше старшего помощника, но премии изменять не может. Сравнение по весу
 * роли дало бы здесь неверный ответ.
 */
export const BONUS_EDIT_ROLES: readonly LegacyBonusRole[] = [
  'SENIOR_STAFF',
  'BOSS',
  'FEDERAL',
  'ADMIN',
];

export function canEditBonuses(role: string | null | undefined): boolean {
  return role ? BONUS_EDIT_ROLES.includes(role as LegacyBonusRole) : false;
}

/**
 * Роли, которым доступно назначение премии.
 *
 * Уже́ круга изменения премий: старший помощник назначать премии не может —
 * назначает руководитель округа, федеральный уровень и администратор.
 */
export const BONUS_ASSIGN_ROLES: readonly LegacyBonusRole[] = ['BOSS', 'FEDERAL', 'ADMIN'];

/**
 * Может ли сотрудник назначить премию (направить на согласование).
 *
 * Ограничение по округу проверяется отдельно — назначить можно сотруднику
 * своего округа.
 */
export function canAssignBonus(actor: LegacyBonusUser | null): boolean {
  return actor?.role ? BONUS_ASSIGN_ROLES.includes(actor.role as LegacyBonusRole) : false;
}

/**
 * Соответствие ролей ЕИАС «Фемида» ролям действующей системы.
 *
 * Нужно для сотрудников, которых нет в перенесённом документе `users`:
 * правила премирования сформулированы в терминах ролей действующей системы.
 */
export const ROLE_TO_LEGACY_BONUS_ROLE: Record<Role, LegacyBonusRole> = {
  EMPLOYEE: 'STAFF',
  SENIOR_ASSISTANT: 'SENIOR_STAFF',
  USP: 'USP',
  BOSS: 'BOSS',
  FEDERAL: 'FEDERAL',
  ADMIN: 'ADMIN',
};

/**
 * Базовые суммы премирования по должностям.
 *
 * Из Положения о премиях (приказ № ГП-189 от 7 июня 2026 г.). Сопоставление
 * ведётся по нормализованному названию должности; для не перечисленных
 * должностей базовая сумма берётся из настроек премирования.
 */
export const BONUS_BASE_AMOUNT_BY_POSITION: Readonly<Record<string, number>> = {
  // Генеральная прокуратура — базовая сумма 4 млн (ст. 2.1).
  'генеральный прокурор российской федерации': 4_000_000,
  'первый заместитель генерального прокурора российской федерации': 4_000_000,
  'заместитель генерального прокурора российской федерации': 4_000_000,
  // Руководство субъекта (таблица ст. 3).
  'прокурор субъекта': 4_000_000,
  'первый заместитель прокурора субъекта': 4_000_000,
  'заместитель прокурора субъекта': 4_000_000,
  'начальник управления': 2_500_000,
  'начальник отдела на правах управления': 2_500_000,
  'старший помощник прокурора субъекта': 2_500_000,
  'старший помощник прокурора': 2_500_000,
  'помощник прокурора субъекта': 2_500_000,
  'помощник прокурора': 2_500_000,
};

/** Базовая сумма премии для должности; `null` — в таблице нет. */
export function baseAmountForPosition(title: string | null | undefined): number | null {
  if (!title) {
    return null;
  }

  const normalized = title.trim().toLowerCase().replace(/ё/gu, 'е').replace(/\s+/gu, ' ');
  return BONUS_BASE_AMOUNT_BY_POSITION[normalized] ?? null;
}

/** Максимальный коэффициент премирования по Положению (ст. 3.1). */
export const BONUS_MAX_COEFFICIENT = 2;

/** Шаг коэффициента премирования (ст. 3.1). */
export const BONUS_COEFFICIENT_STEP = 0.25;

/** Предельная сумма премирования одного человека (ст. 1.8). */
export const BONUS_MAX_TOTAL_AMOUNT = 10_000_000;

/**
 * Роль, начиная с которой доступен реестр премий.
 *
 * Реестр раскрывает суммы и основания премирования по всему округу, поэтому
 * рядовому сотруднику он закрыт — так же, как и в боковой навигации.
 */
export const BONUS_READ_MIN_ROLE: Role = 'SENIOR_ASSISTANT';

/** Название субъекта, для которого выплата за счёт округа не предусмотрена. */
export const GENERAL_OFFICE_SUBJECT = 'Генеральная прокуратура';

/** Должность, дающая право отчитаться о выплате за округ. */
export const SUBJECT_PROSECUTOR_TITLE = 'Прокурор субъекта';

/** Статус премии, при котором вообще возможна выплата. */
export const BONUS_APPROVED_STATUS = 'approved';

/** Источник премии, требующий выплаты за счёт округа. */
export const BONUS_FEDERAL_REQUEST_SOURCE = 'federal_request';

/**
 * Состояния выплаты за счёт округа — три этапа рабочего процесса.
 *
 * `awaiting_subject_dispatch` и `pending_subject_payout` — **разные** этапы,
 * а не синонимы: премия сначала направляется Генеральной прокуратурой в
 * субъект, и только затем прокурор субъекта отчитывается о выплате.
 *
 * 1. `awaiting_subject_dispatch` — премия утверждена и требует выплаты
 *    округом, но ещё не направлена в субъект (значение по умолчанию, когда
 *    выплата требуется, а состояние в записи не проставлено).
 * 2. `pending_subject_payout` — направлена в субъект; прокурор субъекта
 *    должен выплатить и отчитаться.
 * 3. `reported` — прокурор субъекта отчитался о выплате с подтверждением.
 */
export const BONUS_PAYOUT_AWAITING_DISPATCH = 'awaiting_subject_dispatch';
export const BONUS_PAYOUT_PENDING = 'pending_subject_payout';
export const BONUS_PAYOUT_REPORTED = 'reported';
export const BONUS_PAYOUT_NOT_REQUIRED = 'not_required';

export type BonusPayoutStatus =
  | 'not_required'
  | 'awaiting_subject_dispatch'
  | 'pending_subject_payout'
  | 'reported';

export const BONUS_PAYOUT_STATUS_LABEL: Record<BonusPayoutStatus, string> = {
  not_required: 'Выплата без отчёта',
  awaiting_subject_dispatch: 'Ожидает направления в субъект',
  pending_subject_payout: 'Ожидает выплату субъектом',
  reported: 'Выплата подтверждена',
};

const STORED_PAYOUT_STATUSES: readonly string[] = [
  BONUS_PAYOUT_AWAITING_DISPATCH,
  BONUS_PAYOUT_PENDING,
  BONUS_PAYOUT_REPORTED,
];

export function isPayoutPending(status: string | null | undefined): boolean {
  return status === BONUS_PAYOUT_PENDING;
}

export function isPayoutReported(status: string | null | undefined): boolean {
  return status === BONUS_PAYOUT_REPORTED;
}

/** Запись о премии. Поля действующей системы сохранены как есть. */
export interface BonusRecord {
  id: string;
  userId?: string | null;
  employeeId?: string | null;
  employeeName?: string | null;
  subject?: string | null;
  status?: string | null;
  source?: string | null;
  reason?: string | null;
  amount?: number | null;
  baseAmount?: number | null;
  multiplier?: number | null;
  periodKey?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  archived?: boolean | null;

  payoutTracking?: boolean | null;
  payoutStatus?: string | null;
  payoutDispatchedAt?: string | null;
  payoutDispatchedBy?: string | null;
  payoutReportedAt?: string | null;
  payoutReportedBy?: string | null;
  payoutProofUrl?: string | null;
  payoutProofName?: string | null;
  payoutComment?: string | null;

  [key: string]: unknown;
}

/** Сотрудник действующей системы. */
export interface LegacyBonusUser {
  id: string;
  /** Вход в действующей системе выполняется по ФИО. */
  login?: string | null;
  name?: string | null;
  surname?: string | null;
  subject?: string | null;
  role?: string | null;
  positionId?: string | null;
  /**
   * Название должности напрямую.
   *
   * Заполняется для сотрудников ЕИАС «Фемида», которых нет в документе
   * действующей системы: их должность известна из личного дела, а
   * идентификатора в справочнике действующей системы у неё нет.
   */
  positionTitle?: string | null;
  isSystemAdmin?: boolean | null;
  blocked?: boolean | null;
}

/** Справочник должностей действующей системы: перечни по ролям. */
export type LegacyPositionDirectory = Record<string, { id: string; title: string }[]>;

/** Сведения, необходимые для проверки правил. */
export interface BonusContext {
  readonly users: readonly LegacyBonusUser[];
  readonly positions: LegacyPositionDirectory;
}

/** Сравнение названий округов: пробелы и регистр не должны влиять. */
export function isSameSubject(left: string | null | undefined, right: string | null | undefined): boolean {
  return normalizeSubject(left) === normalizeSubject(right) && normalizeSubject(left).length > 0;
}

function normalizeSubject(value: string | null | undefined): string {
  return (value ?? '').trim().toLowerCase().replace(/ё/gu, 'е').replace(/\s+/gu, ' ');
}

function isGeneralOffice(value: string | null | undefined): boolean {
  return normalizeSubject(value) === normalizeSubject(GENERAL_OFFICE_SUBJECT);
}

function findUser(context: BonusContext, id: string | null | undefined): LegacyBonusUser | null {
  if (!id) {
    return null;
  }
  return context.users.find((user) => user.id === id) ?? null;
}

/** Название должности сотрудника по справочнику. */
export function positionTitleOf(
  context: BonusContext,
  user: LegacyBonusUser | null,
): string | null {
  if (user?.positionTitle) {
    return user.positionTitle;
  }

  if (!user?.positionId) {
    return null;
  }

  // Должности сгруппированы по ролям; при расхождении роли и группы
  // должность ищется по всему справочнику.
  const groups = user.role ? [user.role, ...Object.keys(context.positions)] : Object.keys(context.positions);

  for (const group of groups) {
    const found = context.positions[group]?.find((position) => position.id === user.positionId);
    if (found) {
      return found.title;
    }
  }

  return null;
}

/** Занимает ли сотрудник должность прокурора субъекта. */
export function isSubjectProsecutor(context: BonusContext, user: LegacyBonusUser | null): boolean {
  const title = positionTitleOf(context, user);
  return title !== null && title.trim().toLowerCase() === SUBJECT_PROSECUTOR_TITLE.toLowerCase();
}

/**
 * Требуется ли выплата премии за счёт округа.
 *
 * Порядок проверок значим: он воспроизводит поведение действующей системы,
 * и перестановка ветвей изменила бы результат по существующим записям.
 */
export function requiresSubjectPayout(bonus: BonusRecord, context: BonusContext): boolean {
  // 1. Невыплаченная премия к округу отношения не имеет.
  if (bonus.status !== BONUS_APPROVED_STATUS) {
    return false;
  }

  // 2. Однажды включённый контроль выплаты сохраняется навсегда: иначе
  //    изменение должности получателя задним числом сняло бы обязательство.
  if (bonus.payoutTracking === true) {
    return true;
  }

  // 3. Премия Генеральной прокуратуры или без округа выплачивается не округом.
  if (!bonus.subject || isGeneralOffice(bonus.subject)) {
    return false;
  }

  // 4. Премия по запросу федерального уровня выплачивается округом всегда.
  if (bonus.source === BONUS_FEDERAL_REQUEST_SOURCE) {
    return true;
  }

  // 5. Без получателя определить обязательство невозможно.
  const recipient = findUser(context, bonus.userId ?? bonus.employeeId);
  if (!recipient) {
    return false;
  }

  // 6. Сотрудник Генеральной прокуратуры получает выплату не от округа.
  if (isGeneralOffice(recipient.subject)) {
    return false;
  }

  // 7. Рядовой сотрудник — выплата за счёт округа.
  if (recipient.role === 'STAFF') {
    return true;
  }

  // 8. Руководителю округа платит округ, но прокурор субъекта — исключение:
  //    сам себе выплату за счёт округа он не назначает.
  return recipient.role === 'BOSS' && !isSubjectProsecutor(context, recipient);
}

/**
 * Текущий этап выплаты премии.
 *
 * Если выплата требуется, а состояние в записи не проставлено — премия
 * считается ожидающей направления в субъект (значение по умолчанию в
 * действующей системе).
 */
export function effectivePayoutStatus(
  bonus: BonusRecord,
  context: BonusContext,
): BonusPayoutStatus {
  if (!requiresSubjectPayout(bonus, context)) {
    return BONUS_PAYOUT_NOT_REQUIRED;
  }

  const stored = (bonus.payoutStatus ?? '').trim();
  if (STORED_PAYOUT_STATUSES.includes(stored)) {
    return stored as BonusPayoutStatus;
  }

  return BONUS_PAYOUT_AWAITING_DISPATCH;
}

/**
 * Может ли пользователь направить премию в субъект для выплаты.
 *
 * Направление переводит премию из «ожидает направления» в «ожидает выплату
 * субъектом» и выполняется на уровне Генеральной прокуратуры — федеральным
 * уровнем или системным администратором. До направления прокурор субъекта
 * отчитаться о выплате не может.
 */
export function canDispatchSubjectPayout(
  bonus: BonusRecord,
  actor: LegacyBonusUser | null,
  context: BonusContext,
): boolean {
  if (effectivePayoutStatus(bonus, context) !== BONUS_PAYOUT_AWAITING_DISPATCH) {
    return false;
  }

  if (!actor) {
    return false;
  }

  return actor.isSystemAdmin === true || actor.role === 'FEDERAL';
}

/**
 * Может ли сотрудник отчитаться о выплате премии.
 * Проверки идут в том же порядке, что и в действующей системе.
 */
export function canReportPayout(
  bonus: BonusRecord,
  actor: LegacyBonusUser | null,
  context: BonusContext,
): boolean {
  // 1. Отчёт возможен только по премии, которую выплачивает округ.
  if (!requiresSubjectPayout(bonus, context)) {
    return false;
  }

  // 2. Отчитаться можно только после направления в субъект: премия должна
  //    ожидать выплаты либо уже быть отражённой. «Ожидает направления» —
  //    ещё не этап субъекта.
  const status = effectivePayoutStatus(bonus, context);
  if (status !== BONUS_PAYOUT_PENDING && status !== BONUS_PAYOUT_REPORTED) {
    return false;
  }

  if (!actor) {
    return false;
  }

  // 3. Системный администратор не ограничен округом и должностью.
  if (actor.isSystemAdmin === true) {
    return true;
  }

  // 4. Отчитывается прокурор субъекта — тот, кто распоряжается средствами округа.
  if (!isSubjectProsecutor(context, actor)) {
    return false;
  }

  // 5. И только по своему округу.
  return isSameSubject(actor.subject, bonus.subject);
}

// ---------------------------------------------------------------------------
// Настройки премирования
// ---------------------------------------------------------------------------

export interface BonusSettings {
  baseAmount: number;
  maxMultiplier: number;
  approvalRequired: boolean;
  payPeriod: string;
  /**
   * День месяца, с которого начинается новый отчётный период.
   * Период идёт от этого числа одного месяца до кануна того же числа
   * следующего. По умолчанию — 20-е.
   */
  periodStartDay: number;
  reportDeadlineDay: number;
  reportDeadlineTime: string;
  /**
   * Настройки режима технических работ хранятся в этом же объекте.
   * Это устройство действующей системы: вынести их отдельно можно только
   * сохранив чтение прежнего JSON.
   */
  maintenanceEnabled: boolean;
  maintenanceGif: string;
  maintenanceScheduledAt: string;
  maintenanceAnnouncement: string;
  maintenanceActivatedAt: string;
}

/** День начала отчётного периода по умолчанию. */
export const BONUS_PERIOD_START_DAY = 20;

export const BONUS_SETTINGS_DEFAULTS: BonusSettings = {
  baseAmount: 50000,
  maxMultiplier: 3.0,
  approvalRequired: true,
  payPeriod: 'biweekly',
  periodStartDay: BONUS_PERIOD_START_DAY,
  reportDeadlineDay: 25,
  reportDeadlineTime: '23:59',
  maintenanceEnabled: false,
  maintenanceGif: 'download.gif',
  maintenanceScheduledAt: '',
  maintenanceAnnouncement: '',
  maintenanceActivatedAt: '',
};

export interface ReportingPeriod {
  /** Ключ периода в формате ГГГГ-ММ по месяцу начала периода. */
  key: string;
  /** Человекочитаемая подпись, например «20.06.2026 — 19.07.2026». */
  label: string;
  /** Начало периода включительно (ISO). */
  start: string;
  /** Конец периода включительно (ISO, последняя миллисекунда суток). */
  end: string;
}

function clampPeriodStartDay(startDay: number | null | undefined): number {
  const value = Number(startDay);
  return Number.isFinite(value) ? Math.max(1, Math.min(28, Math.trunc(value))) : BONUS_PERIOD_START_DAY;
}

function formatDay(date: Date): string {
  return `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}`;
}

/**
 * Отчётный период, которому принадлежит дата.
 *
 * Период начинается в `startDay` число месяца и длится до кануна того же
 * числа следующего месяца. Если дата раньше `startDay`, она относится к
 * периоду, начавшемуся в предыдущем месяце.
 *
 * Ключ периода — месяц его начала (ГГГГ-ММ): период, начавшийся 20 июня,
 * имеет ключ «2026-06».
 */
export function resolveReportingPeriod(
  input: Date | string | number = Date.now(),
  startDay: number = BONUS_PERIOD_START_DAY,
): ReportingPeriod {
  const at = input instanceof Date ? input : new Date(input);
  const base = Number.isNaN(at.getTime()) ? new Date() : at;
  const day = clampPeriodStartDay(startDay);

  // Начало периода: startDay текущего месяца, а если дата раньше — прошлого.
  const startMonthOffset = base.getDate() >= day ? 0 : -1;
  const start = new Date(base.getFullYear(), base.getMonth() + startMonthOffset, day, 0, 0, 0, 0);
  const end = new Date(start.getFullYear(), start.getMonth() + 1, day, 0, 0, 0, 0);
  end.setMilliseconds(end.getMilliseconds() - 1);

  return {
    key: `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}`,
    label: `${formatDay(start)} — ${formatDay(end)}`,
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

function pickNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function pickString(value: unknown, fallback: string): string {
  return typeof value === 'string' ? value : fallback;
}

function pickBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

/**
 * Приведение настроек к известному набору полей.
 *
 * Недостающие поля добираются из значений по умолчанию, посторонние
 * отбрасываются. Выполняется и при чтении, и при записи — так в действующей
 * системе, и без этого накопленный мусор попадал бы в интерфейс.
 */
export function normalizeBonusSettings(raw: unknown): BonusSettings {
  const source = (typeof raw === 'object' && raw !== null ? raw : {}) as Record<string, unknown>;

  return {
    baseAmount: pickNumber(source.baseAmount, BONUS_SETTINGS_DEFAULTS.baseAmount),
    maxMultiplier: pickNumber(source.maxMultiplier, BONUS_SETTINGS_DEFAULTS.maxMultiplier),
    approvalRequired: pickBoolean(
      source.approvalRequired,
      BONUS_SETTINGS_DEFAULTS.approvalRequired,
    ),
    payPeriod: pickString(source.payPeriod, BONUS_SETTINGS_DEFAULTS.payPeriod),
    periodStartDay: clampPeriodStartDay(
      typeof source.periodStartDay === 'number'
        ? source.periodStartDay
        : BONUS_SETTINGS_DEFAULTS.periodStartDay,
    ),
    reportDeadlineDay: pickNumber(
      source.reportDeadlineDay,
      BONUS_SETTINGS_DEFAULTS.reportDeadlineDay,
    ),
    reportDeadlineTime: pickString(
      source.reportDeadlineTime,
      BONUS_SETTINGS_DEFAULTS.reportDeadlineTime,
    ),
    maintenanceEnabled: pickBoolean(
      source.maintenanceEnabled,
      BONUS_SETTINGS_DEFAULTS.maintenanceEnabled,
    ),
    maintenanceGif: pickString(source.maintenanceGif, BONUS_SETTINGS_DEFAULTS.maintenanceGif),
    maintenanceScheduledAt: pickString(
      source.maintenanceScheduledAt,
      BONUS_SETTINGS_DEFAULTS.maintenanceScheduledAt,
    ),
    maintenanceAnnouncement: pickString(
      source.maintenanceAnnouncement,
      BONUS_SETTINGS_DEFAULTS.maintenanceAnnouncement,
    ),
    maintenanceActivatedAt: pickString(
      source.maintenanceActivatedAt,
      BONUS_SETTINGS_DEFAULTS.maintenanceActivatedAt,
    ),
  };
}

// ---------------------------------------------------------------------------
// Загрузка отчёта о выплате
// ---------------------------------------------------------------------------

/** Каталог подтверждений выплаты. Совпадает с путём действующей системы. */
export const BONUS_PAYOUT_PREFIX = 'uploads/bonus-payouts';

export const BONUS_PROOF_MAX_SIZE_BYTES = 10 * 1024 * 1024;

export const BONUS_PROOF_MIME_TYPES: readonly string[] = [
  'image/png',
  'image/jpeg',
  'image/webp',
];

export const BONUS_PROOF_EXTENSION: Readonly<Record<string, string>> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
};

// ---------------------------------------------------------------------------
// Контракты API
// ---------------------------------------------------------------------------

export interface BonusDto extends BonusRecord {
  /** Требуется ли выплата за счёт округа — вычисляется на сервере. */
  requiresSubjectPayout: boolean;
  /** Текущий этап выплаты. */
  payoutStage: BonusPayoutStatus;
  /** Может ли текущий пользователь направить премию в субъект. */
  canDispatchSubjectPayout: boolean;
  /** Может ли текущий пользователь отчитаться о выплате. */
  canReportPayout: boolean;
  /** Отчёт о выплате уже представлен. */
  isPayoutReported: boolean;
}

export interface BonusListResponse {
  items: BonusDto[];
  total: number;
  summary: {
    total: number;
    approved: number;
    /** На согласовании. */
    pending: number;
    /** Ожидают направления в субъект (этап Генеральной прокуратуры). */
    awaitingDispatch: number;
    /** Направлены в субъект и ожидают отчёта о выплате. */
    awaitingPayout: number;
    reported: number;
    totalAmount: number;
  };
  /** Текущий отчётный период по настройке дня начала. */
  currentPeriod: ReportingPeriod;
  /** Может ли текущий пользователь назначать премии. */
  canAssign: boolean;
  settings: BonusSettings;
}

/** Сотрудник, которому можно назначить премию. */
export interface BonusRecipientDto {
  id: string;
  fullName: string;
  position: string;
  positionTitle: string | null;
  subject: string | null;
  role: string | null;
  /** Базовая сумма по должности из Положения, если определена. */
  baseAmount: number | null;
}

export interface BonusRecipientsResponse {
  subject: string | null;
  period: ReportingPeriod;
  recipients: BonusRecipientDto[];
}
