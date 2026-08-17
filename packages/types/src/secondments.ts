/** Командировки (временное направление в другой субъект). */
import { type Role } from './roles';

export const SECONDMENT_MANAGE_MIN_ROLE: Role = 'FEDERAL';

export const SECONDMENT_STATUSES = ['PLANNED', 'ACTIVE', 'COMPLETED', 'CANCELLED'] as const;
export type SecondmentStatus = (typeof SECONDMENT_STATUSES)[number];

export const SECONDMENT_STATUS_LABEL: Record<SecondmentStatus, string> = {
  PLANNED: 'Запланирована',
  ACTIVE: 'Действует',
  COMPLETED: 'Завершена',
  CANCELLED: 'Отменена',
};

export interface SecondmentPersonRef {
  id: string;
  fullName: string;
  position: string;
}

export interface SecondmentSubjectRef {
  code: string;
  name: string;
  shortName: string;
}

export interface SecondmentDto {
  id: string;
  /** Кадровый приказ ЭКДО, на основании которого оформлена командировка. */
  ekdoOrderId: string | null;
  employee: SecondmentPersonRef;
  homeSubject: SecondmentSubjectRef | null;
  hostSubject: SecondmentSubjectRef;
  position: string;
  role: Role;
  reason: string;
  status: SecondmentStatus;
  startAt: string;
  endAt: string;
  actualEndAt: string | null;
  createdAt: string;
  version: number;
}

export interface SecondmentListResponse {
  items: SecondmentDto[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  activeCount: number;
}
