import { type ClassRankDictionaryDto } from './dictionaries';
import { type Role } from './roles';

/** Виды кадровых приказов первого выпуска ЭКДО. */
export const EKDO_ORDER_KINDS = [
  'HIRING',
  'APPOINTMENT',
  'TRANSFER',
  'RANK_ASSIGNMENT',
  'SUSPENSION',
  'DISMISSAL',
  'AWARD',
  'BUSINESS_TRIP',
] as const;
export type EkdoOrderKind = (typeof EKDO_ORDER_KINDS)[number];

export const EKDO_ORDER_KIND_LABEL: Record<EkdoOrderKind, string> = {
  HIRING: 'Приём на службу',
  APPOINTMENT: 'Назначение на должность',
  TRANSFER: 'Перевод в другой субъект',
  RANK_ASSIGNMENT: 'Присвоение классного чина',
  SUSPENSION: 'Временное отстранение',
  DISMISSAL: 'Увольнение',
  AWARD: 'Награждение',
  BUSINESS_TRIP: 'Командирование',
};

/** Жизненный цикл: редактор → утверждение → ЭП → регистрация → исполнение. */
export const EKDO_ORDER_STATUSES = [
  'DRAFT',
  'PENDING_APPROVAL',
  'APPROVED',
  'SIGNED',
  'REGISTERED',
  'EFFECTIVE',
  'COMPLETED',
  'CANCELLED',
] as const;
export type EkdoOrderStatus = (typeof EKDO_ORDER_STATUSES)[number];

export const EKDO_ORDER_STATUS_LABEL: Record<EkdoOrderStatus, string> = {
  DRAFT: 'Черновик',
  PENDING_APPROVAL: 'На утверждении',
  APPROVED: 'Утверждён',
  SIGNED: 'Подписан',
  REGISTERED: 'Зарегистрирован',
  EFFECTIVE: 'Вступил в силу',
  COMPLETED: 'Исполнен',
  CANCELLED: 'Отменён',
};

export const EKDO_EVENT_TYPES = [
  'CREATED',
  'UPDATED',
  'SUBMITTED',
  'APPROVED',
  'SIGNED',
  'REGISTERED',
  'APPLIED',
  'ACKNOWLEDGED',
  'CANCELLED',
] as const;
export type EkdoEventType = (typeof EKDO_EVENT_TYPES)[number];

export const EKDO_EVENT_LABEL: Record<EkdoEventType, string> = {
  CREATED: 'Приказ сформирован',
  UPDATED: 'Черновик изменён в редакторе',
  SUBMITTED: 'Направлен на утверждение',
  APPROVED: 'Приказ утверждён',
  SIGNED: 'Документ подписан игровой ЭП',
  REGISTERED: 'Приказ зарегистрирован',
  APPLIED: 'Кадровое действие применено',
  ACKNOWLEDGED: 'Сотрудник ознакомлен',
  CANCELLED: 'Приказ отменён',
};

export const EKDO_SIGNING_ROLES: readonly Role[] = ['BOSS', 'FEDERAL'];
export const EKDO_TRIP_ROLES = [
  'EMPLOYEE',
  'SENIOR_ASSISTANT',
  'USP',
  'BOSS',
  'FEDERAL',
] as const satisfies readonly Role[];
export type EkdoTripRole = (typeof EKDO_TRIP_ROLES)[number];

export interface EkdoPersonRef {
  id: string;
  fullName: string;
  position: string;
  rank: string | null;
}

export interface EkdoSubjectRef {
  code: string;
  name: string;
  shortName: string;
}

/** Структурированные реквизиты кадрового решения. */
export interface EkdoOrderDetails {
  position?: string;
  targetSubjectCode?: string;
  targetSubjectName?: string;
  endAt?: string;
  awardCode?: string;
  awardTitle?: string;
  tripRole?: EkdoTripRole;
  previousPosition?: string;
  previousSubjectCode?: string;
  previousSubjectName?: string;
  previousStatus?: string;
}

export interface EkdoSignatureDto {
  signer: EkdoPersonRef;
  signedAt: string;
  algorithm: string;
  keyId: string;
  /** Собственный регистрационный номер игровой ЭП. */
  registrationNumber: string;
  contentHash: string;
  signatureValue: string;
}

export interface EkdoAcknowledgementDto {
  recipient: EkdoPersonRef;
  acknowledgedAt: string | null;
}

export interface EkdoEventDto {
  id: string;
  type: EkdoEventType;
  actor: EkdoPersonRef | null;
  createdAt: string;
}

export interface EkdoOrderListItemDto {
  id: string;
  publicId: string;
  kind: EkdoOrderKind;
  status: EkdoOrderStatus;
  registrationNumber: string | null;
  manualNumber: string | null;
  documentDate: string | null;
  title: string;
  issuer: EkdoSubjectRef;
  targetEmployee: EkdoPersonRef;
  targetRank: string | null;
  author: EkdoPersonRef;
  approver: EkdoPersonRef | null;
  signer: EkdoPersonRef | null;
  effectiveAt: string;
  requiresAcknowledgement: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EkdoOrderDto extends EkdoOrderListItemDto {
  place: string;
  preamble: string;
  decisionText: string;
  reason: string;
  controlText: string;
  previousRank: string | null;
  details: EkdoOrderDetails;
  targetProfileVersion: number;
  version: number;
  submittedAt: string | null;
  approvedAt: string | null;
  signedAt: string | null;
  registeredAt: string | null;
  appliedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  cancellationReason: string | null;
  signature: EkdoSignatureDto | null;
  acknowledgement: EkdoAcknowledgementDto | null;
  events: EkdoEventDto[];
  permissions: {
    canEdit: boolean;
    canSubmit: boolean;
    canApprove: boolean;
    canSign: boolean;
    canRegister: boolean;
    canApply: boolean;
    canCancel: boolean;
    canAcknowledge: boolean;
  };
}

export interface EkdoOrderListResponse {
  items: EkdoOrderListItemDto[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface EkdoCapabilitiesDto {
  canCreate: boolean;
  canManagePersonnelOfficer: boolean;
  isPersonnelOfficer: boolean;
  personnelOfficer: EkdoPersonRef | null;
  issuer: EkdoSubjectRef;
}

export interface EkdoReferencesDto {
  subjects: { code: string; name: string; shortName: string }[];
  positions: { code: string; title: string }[];
  medals: { code: string; title: string; iconUrl: string | null }[];
  classRanks: ClassRankDictionaryDto[];
}

export interface EkdoLearningSuggestionDto {
  sampleCount: number;
  suggestion: {
    sourceOrderId: string;
    learnedAt: string;
    title: string;
    preamble: string;
    controlText: string;
    decisionExample: string;
  } | null;
}

export interface EkdoVerificationDto {
  publicId: string;
  valid: boolean;
  status: EkdoOrderStatus;
  registrationNumber: string | null;
  documentDate: string | null;
  title: string;
  issuer: EkdoSubjectRef;
  signer: EkdoPersonRef | null;
  signedAt: string | null;
  algorithm: string | null;
  keyId: string | null;
  signatureRegistrationNumber: string | null;
  contentHash: string | null;
}
