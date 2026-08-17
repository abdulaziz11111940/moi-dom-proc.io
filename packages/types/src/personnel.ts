/**
 * Личные дела сотрудников прокуратуры.
 *
 * Личное дело содержит анкетные сведения сотрудника и неизменяемую кадровую
 * историю: каждое изменение должности, роли, субъекта, классного чина или
 * статуса фиксируется отдельной записью и не переписывается задним числом.
 */
import { type EmployeeStatus } from './applications';
import { type ClassRankDictionaryDto } from './dictionaries';
import { type PositionGroup, type PositionScope } from './positions';
import { type Role } from './roles';

/** Вид кадрового действия. */
export const PERSONNEL_ACTION_TYPES = [
  'HIRED',
  'POSITION_CHANGE',
  'ROLE_CHANGE',
  'SUBJECT_TRANSFER',
  'RANK_ASSIGNMENT',
  'MEDAL_AWARD',
  'BUSINESS_TRIP',
  'SUSPENSION',
  'REINSTATEMENT',
  'DISMISSAL',
  'RESERVE_TRANSFER',
  'PROFILE_UPDATE',
] as const;

export type PersonnelActionType = (typeof PERSONNEL_ACTION_TYPES)[number];

export const PERSONNEL_ACTION_LABEL: Record<PersonnelActionType, string> = {
  HIRED: 'Приём на службу',
  POSITION_CHANGE: 'Назначение на должность',
  ROLE_CHANGE: 'Изменение роли в системе',
  SUBJECT_TRANSFER: 'Перевод в другой субъект',
  RANK_ASSIGNMENT: 'Присвоение классного чина',
  MEDAL_AWARD: 'Награждение',
  BUSINESS_TRIP: 'Командирование',
  SUSPENSION: 'Временное отстранение',
  REINSTATEMENT: 'Восстановление в должности',
  DISMISSAL: 'Увольнение',
  RESERVE_TRANSFER: 'Зачисление в кадровый резерв',
  PROFILE_UPDATE: 'Изменение анкетных сведений',
};

/**
 * Кадровые действия, изменяющие статус сотрудника.
 * Для них статус в личном деле определяется самим действием.
 */
export const PERSONNEL_STATUS_BY_ACTION: Partial<Record<PersonnelActionType, EmployeeStatus>> = {
  HIRED: 'ACTIVE',
  SUSPENSION: 'SUSPENDED',
  REINSTATEMENT: 'ACTIVE',
  DISMISSAL: 'DISMISSED',
  RESERVE_TRANSFER: 'RESERVE',
};

/** Действия, требующие обязательного основания. */
export const PERSONNEL_ACTIONS_REQUIRING_REASON: readonly PersonnelActionType[] = [
  'SUSPENSION',
  'DISMISSAL',
  'RESERVE_TRANSFER',
  'SUBJECT_TRANSFER',
  'ROLE_CHANGE',
];

export function personnelActionRequiresReason(type: PersonnelActionType): boolean {
  return PERSONNEL_ACTIONS_REQUIRING_REASON.includes(type);
}

/**
 * Статусы, при которых сотрудник выбыл из состава: личное дело сохраняется,
 * но в основном реестре не показывается. Кадровая история остаётся доступной,
 * поэтому дела не удаляются, а выделяются в отдельный перечень.
 */
export const ARCHIVED_EMPLOYEE_STATUSES: readonly EmployeeStatus[] = ['DISMISSED', 'BLOCKED'];

export function isArchivedEmployeeStatus(status: EmployeeStatus): boolean {
  return ARCHIVED_EMPLOYEE_STATUSES.includes(status);
}

/** Часть реестра: состоящие на службе либо выбывшие. */
export const PERSONNEL_SCOPES = ['SERVICE', 'ARCHIVE'] as const;

export type PersonnelScope = (typeof PERSONNEL_SCOPES)[number];

export const PERSONNEL_SCOPE_LABEL: Record<PersonnelScope, string> = {
  SERVICE: 'На службе',
  ARCHIVE: 'Архив',
};

/**
 * Роль, начиная с которой доступны личные дела.
 * Собственное личное дело сотрудник видит независимо от роли.
 */
export const PERSONNEL_READ_MIN_ROLE: Role = 'SENIOR_ASSISTANT';

/** Роль, начиная с которой доступны кадровые действия в своём субъекте. */
export const PERSONNEL_MANAGE_MIN_ROLE: Role = 'BOSS';

/**
 * Роль, начиная с которой доступны изменение роли в системе и перевод между
 * субъектами. Роль определяет объём доступа, поэтому её изменение вынесено
 * на федеральный уровень: сотрудник не может повысить себе полномочия.
 */
export const PERSONNEL_ELEVATED_MIN_ROLE: Role = 'FEDERAL';

// ---------------------------------------------------------------------------
// Контракты API
// ---------------------------------------------------------------------------

export interface PersonnelPersonRef {
  id: string;
  fullName: string;
  position: string;
}

/** Строка реестра личных дел. */
export interface PersonnelListItemDto {
  id: string;
  fullName: string;
  position: string;
  rank: string | null;
  serviceId: string | null;
  subject: { code: string; name: string; shortName: string };
  primaryRole: Role | null;
  status: EmployeeStatus;
  appointedAt: string | null;
  hiredAt: string | null;
  lastActivityAt: string | null;
  avatarUrl: string | null;
  /** Незавершённых обращений на исполнении. */
  activeAppeals: number;
  isDemo: boolean;
}

/** Запись кадровой истории. */
export interface PersonnelActionDto {
  id: string;
  /** Связанный приказ ЭКДО, если кадровое действие создано автоматически. */
  ekdoOrderId: string | null;
  type: PersonnelActionType;
  previousValue: string | null;
  newValue: string | null;
  reason: string | null;
  documentRef: string | null;
  effectiveAt: string;
  performedBy: PersonnelPersonRef | null;
  createdAt: string;
}

/** Служебная заметка личного дела. */
export interface PersonnelNoteDto {
  id: string;
  body: string;
  author: PersonnelPersonRef | null;
  createdAt: string;
  canDelete: boolean;
}

export interface PersonnelMedalDto {
  id: string;
  code: string;
  title: string;
  iconUrl: string | null;
  awardedAt: string;
  reason: string;
  ekdoOrderId: string | null;
}

export interface PersonnelPositionReferenceDto {
  code: string;
  title: string;
  group: PositionGroup;
  scope: PositionScope;
  level: number;
}

export interface PersonnelReferencesDto {
  positions: PersonnelPositionReferenceDto[];
  classRanks: ClassRankDictionaryDto[];
}

/** Личное дело сотрудника. */
export interface PersonnelFileDto extends PersonnelListItemDto {
  discordId: string | null;
  contactInfo: string | null;
  manager: PersonnelPersonRef | null;
  subordinates: PersonnelPersonRef[];
  dismissedAt: string | null;
  dismissalReason: string | null;
  roleAssignments: {
    role: Role;
    scopeType: string;
    scopeSubjectCode: string | null;
    validFrom: string;
    validTo: string | null;
  }[];
  actions: PersonnelActionDto[];
  medals: PersonnelMedalDto[];
  notes: PersonnelNoteDto[];
  createdAt: string;
  updatedAt: string;
  version: number;
  /** Полномочия текущего пользователя в отношении этого личного дела. */
  permissions: {
    canEditProfile: boolean;
    canManagePersonnel: boolean;
    canChangeRole: boolean;
  canResetPassword: boolean;
    canTransferSubject: boolean;
    canWriteNotes: boolean;
    canManageAttachments: boolean;
  };
}

/**
 * Сводка реестра личных дел.
 *
 * Считается по всем доступным записям независимо от выбранной части реестра,
 * поэтому счётчики одинаковы на обеих вкладках и по ним видно наполнение
 * архива, не переключаясь в него.
 */
export interface PersonnelSummaryDto {
  total: number;
  active: number;
  suspended: number;
  dismissed: number;
  reserve: number;
  blocked: number;
  /** Состоящие на службе: все, кроме уволенных и заблокированных. */
  inService: number;
  /** Выбывшие: уволенные и заблокированные. */
  archived: number;
}

/** Ответ реестра личных дел. */
export interface PersonnelListResponse {
  items: PersonnelListItemDto[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  summary: PersonnelSummaryDto;
}
