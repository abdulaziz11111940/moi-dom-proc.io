/** Журнал аудита (администрирование). */
import { type Role } from './roles';

export const AUDIT_READ_MIN_ROLE: Role = 'FEDERAL';

export const AUDIT_RESULTS = ['SUCCESS', 'FAILURE', 'DENIED'] as const;
export type AuditResult = (typeof AUDIT_RESULTS)[number];

export const AUDIT_RESULT_LABEL: Record<AuditResult, string> = {
  SUCCESS: 'Успех',
  FAILURE: 'Ошибка',
  DENIED: 'Отказано',
};

export interface AuditLogEntryDto {
  id: string;
  action: string;
  entityType: string | null;
  entityId: string | null;
  actor: { id: string; fullName: string; position: string } | null;
  actorRole: Role | null;
  subject: { code: string; shortName: string } | null;
  result: AuditResult;
  errorMessage: string | null;
  correlationId: string | null;
  ip: string | null;
  oldValues: unknown;
  newValues: unknown;
  metadata: unknown;
  createdAt: string;
}

export interface AuditListResponse {
  items: AuditLogEntryDto[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
