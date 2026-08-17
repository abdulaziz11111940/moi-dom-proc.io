/**
 * Надзорные проверки.
 *
 * Модуль воспроизводит жизненный цикл проверок действующей системы:
 * запланирована → активна → завершена → на утверждении → утверждена, с
 * возможностью отмены. Собеседования и отчёты по разделам подключаются
 * отдельным этапом; здесь — метаданные, статусная модель и комиссия.
 */
import { type Role } from './roles';

export const INSPECTION_STATUSES = [
  'PLANNED',
  'ACTIVE',
  'COMPLETED',
  'PENDING_APPROVAL',
  'APPROVED',
  'CANCELLED',
] as const;

export type InspectionStatus = (typeof INSPECTION_STATUSES)[number];

export const INSPECTION_STATUS_LABEL: Record<InspectionStatus, string> = {
  PLANNED: 'Запланирована',
  ACTIVE: 'Активна',
  COMPLETED: 'Завершена',
  PENDING_APPROVAL: 'На утверждении',
  APPROVED: 'Утверждена',
  CANCELLED: 'Отменена',
};

/** Незавершённые статусы: по ним считается текущая нагрузка. */
export const ACTIVE_INSPECTION_STATUSES: readonly InspectionStatus[] = [
  'PLANNED',
  'ACTIVE',
  'COMPLETED',
  'PENDING_APPROVAL',
];

export const INSPECTION_RATINGS = [
  'UNSATISFACTORY',
  'SATISFACTORY',
  'GOOD',
  'EXCELLENT',
] as const;

export type InspectionRating = (typeof INSPECTION_RATINGS)[number];

export const INSPECTION_RATING_LABEL: Record<InspectionRating, string> = {
  UNSATISFACTORY: 'Неудовлетворительно',
  SATISFACTORY: 'Удовлетворительно',
  GOOD: 'Хорошо',
  EXCELLENT: 'Отлично',
};

export const INSPECTION_PARTICIPANT_ROLES = ['LEAD', 'MEMBER'] as const;
export type InspectionParticipantRole = (typeof INSPECTION_PARTICIPANT_ROLES)[number];

export const INSPECTION_PARTICIPANT_ROLE_LABEL: Record<InspectionParticipantRole, string> = {
  LEAD: 'Руководитель комиссии',
  MEMBER: 'Член комиссии',
};

export const INSPECTION_PARTICIPANT_SOURCES = ['SUBJECT', 'FEDERAL'] as const;
export type InspectionParticipantSource = (typeof INSPECTION_PARTICIPANT_SOURCES)[number];

/**
 * Допустимые переходы статуса.
 *
 * Утверждённая проверка — терминальное состояние. Отмена возможна с любого
 * рабочего этапа. Переоткрытие возвращает завершённую или поданную на
 * утверждение проверку в работу.
 */
export const INSPECTION_STATUS_TRANSITIONS: Record<InspectionStatus, readonly InspectionStatus[]> = {
  PLANNED: ['ACTIVE', 'CANCELLED'],
  ACTIVE: ['COMPLETED', 'CANCELLED'],
  COMPLETED: ['PENDING_APPROVAL', 'ACTIVE', 'CANCELLED'],
  PENDING_APPROVAL: ['APPROVED', 'ACTIVE', 'CANCELLED'],
  APPROVED: [],
  CANCELLED: [],
};

export function canTransitionInspection(from: InspectionStatus, to: InspectionStatus): boolean {
  return INSPECTION_STATUS_TRANSITIONS[from].includes(to);
}

/** Именованное действие жизненного цикла и целевой статус. */
export const INSPECTION_ACTIONS = {
  activate: 'ACTIVE',
  complete: 'COMPLETED',
  submit: 'PENDING_APPROVAL',
  approve: 'APPROVED',
  reopen: 'ACTIVE',
  cancel: 'CANCELLED',
} as const;

export type InspectionAction = keyof typeof INSPECTION_ACTIONS;

export const INSPECTION_ACTION_LABEL: Record<InspectionAction, string> = {
  activate: 'Начать проверку',
  complete: 'Завершить сбор материалов',
  submit: 'Направить на утверждение',
  approve: 'Утвердить',
  reopen: 'Вернуть в работу',
  cancel: 'Отменить проверку',
};

/**
 * Роль, начиная с которой доступен реестр проверок.
 * Участник комиссии видит свою проверку независимо от роли.
 */
export const INSPECTION_READ_MIN_ROLE: Role = 'USP';

/** Роль, начиная с которой можно создавать проверки и вести цикл в субъекте. */
export const INSPECTION_MANAGE_MIN_ROLE: Role = 'BOSS';

/** Роль координатора проверок на федеральном уровне. */
export const INSPECTION_FEDERAL_MIN_ROLE: Role = 'FEDERAL';

// ---------------------------------------------------------------------------
// Контракты API
// ---------------------------------------------------------------------------

export interface InspectionPersonRef {
  id: string;
  fullName: string;
  position: string;
}

export interface InspectionParticipantDto {
  id: string;
  user: InspectionPersonRef;
  role: InspectionParticipantRole;
  source: InspectionParticipantSource;
  assignedAt: string;
}

/** Строка реестра проверок. */
export interface InspectionListItemDto {
  id: string;
  regNumber: string;
  subject: { code: string; name: string; shortName: string };
  status: InspectionStatus;
  typeLabel: string;
  factionId: string | null;
  periodFrom: string | null;
  periodTo: string | null;
  startsAt: string | null;
  endsAt: string | null;
  lead: InspectionPersonRef | null;
  participantCount: number;
  finalRating: InspectionRating | null;
  createdAt: string;
}

export interface InspectionStatusHistoryDto {
  id: string;
  fromStatus: InspectionStatus | null;
  toStatus: InspectionStatus;
  reason: string | null;
  changedBy: InspectionPersonRef | null;
  createdAt: string;
}

/** Карточка проверки. */
export interface InspectionDto extends InspectionListItemDto {
  basisText: string | null;
  basisLink: string | null;
  description: string | null;
  notesText: string | null;
  collectionClosedAt: string | null;
  createdBy: InspectionPersonRef | null;
  finalConclusion: string | null;
  resolutionText: string | null;
  approvedBy: InspectionPersonRef | null;
  approvedAt: string | null;
  cancelReason: string | null;
  participants: InspectionParticipantDto[];
  statusHistory: InspectionStatusHistoryDto[];
  version: number;
  updatedAt: string;
  /** Полномочия текущего пользователя в отношении этой проверки. */
  permissions: {
    canEditMetadata: boolean;
    canManageParticipants: boolean;
    canManageMaterials: boolean;
    /** Доступные действия жизненного цикла. */
    availableActions: InspectionAction[];
  };
}

export interface InspectionSummaryDto {
  total: number;
  planned: number;
  active: number;
  onApproval: number;
  approved: number;
}

export interface InspectionListResponse {
  items: InspectionListItemDto[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  summary: InspectionSummaryDto;
  canCreate: boolean;
}
