/** Роли и доступ (администрирование назначений ролей). */
import { type Role } from './roles';

export const ROLE_ASSIGNMENT_MANAGE_MIN_ROLE: Role = 'FEDERAL';

export const ROLE_ASSIGNMENT_STATUS_FILTERS = ['active', 'expired', 'all'] as const;
export type RoleAssignmentStatusFilter = (typeof ROLE_ASSIGNMENT_STATUS_FILTERS)[number];

export interface RoleAssignmentPersonRef {
  id: string;
  fullName: string;
  position: string;
}

export interface RoleAssignmentSubjectRef {
  code: string;
  name: string;
  shortName: string;
}

/** Назначение роли в списке администрирования. */
export interface RoleAssignmentAdminDto {
  id: string;
  role: Role;
  scopeType: 'SUBJECT' | 'GLOBAL' | 'SYSTEM';
  scopeSubject: RoleAssignmentSubjectRef | null;
  isPrimary: boolean;
  userProfile: RoleAssignmentPersonRef & { subject: RoleAssignmentSubjectRef };
  assignedBy: RoleAssignmentPersonRef | null;
  reason: string | null;
  validFrom: string;
  validTo: string | null;
  createdAt: string;
}

export interface RoleAssignmentListResponse {
  items: RoleAssignmentAdminDto[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
