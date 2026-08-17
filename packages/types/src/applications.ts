/** Статусы заявки на регистрацию сотрудника. */
export const APPLICATION_STATUSES = [
  'PENDING',
  'NEEDS_CLARIFICATION',
  'APPROVED',
  'REJECTED',
  'WITHDRAWN',
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const APPLICATION_STATUS_LABEL: Record<ApplicationStatus, string> = {
  PENDING: 'На рассмотрении',
  NEEDS_CLARIFICATION: 'Возвращена на уточнение',
  APPROVED: 'Одобрена',
  REJECTED: 'Отклонена',
  WITHDRAWN: 'Отозвана',
};

/** Статусы учётной записи сотрудника. */
export const EMPLOYEE_STATUSES = [
  'ACTIVE',
  'ON_INTERNSHIP',
  'ON_BUSINESS_TRIP',
  'SUSPENDED',
  'DISMISSED',
  'RESERVE',
  'BLOCKED',
] as const;

export type EmployeeStatus = (typeof EMPLOYEE_STATUSES)[number];

export const EMPLOYEE_STATUS_LABEL: Record<EmployeeStatus, string> = {
  ACTIVE: 'Действующий',
  ON_INTERNSHIP: 'На стажировке',
  ON_BUSINESS_TRIP: 'В командировке',
  SUSPENDED: 'Временно отстранён',
  DISMISSED: 'Уволен',
  RESERVE: 'В резерве',
  BLOCKED: 'Заблокирован',
};

/**
 * Статусы, при которых сотрудник считается несущим службу.
 * Только им доступно назначение исполнителем.
 */
export const ACTIVE_EMPLOYEE_STATUSES: readonly EmployeeStatus[] = [
  'ACTIVE',
  'ON_INTERNSHIP',
  'ON_BUSINESS_TRIP',
];

/** Данные заявки, отображаемые на экране ожидания. */
export interface RegistrationApplicationSummary {
  id: string;
  fullName: string;
  subjectCode: string;
  subjectName: string;
  desiredPosition: string;
  status: ApplicationStatus;
  submittedAt: string;
  reviewComment?: string | null;
}

/** Роль, начиная с которой доступно рассмотрение заявок. */
export const APPLICATION_REVIEW_MIN_ROLE = 'BOSS' as const;

export interface ApplicationPersonRef {
  id: string;
  fullName: string;
  position: string;
}

/** Заявка на регистрацию в очереди рассмотрения. */
export interface RegistrationApplicationDto {
  id: string;
  fullName: string;
  discordId: string | null;
  subject: { code: string; name: string; shortName: string };
  desiredPosition: string;
  comment: string | null;
  status: ApplicationStatus;
  reviewComment: string | null;
  reviewedAt: string | null;
  reviewedBy: ApplicationPersonRef | null;
  createdProfile: ApplicationPersonRef | null;
  grantedRole: string | null;
  grantedPosition: string | null;
  possibleDuplicate: ApplicationPersonRef | null;
  createdAt: string;
  version: number;
}

/**
 * Результат одобрения заявки.
 *
 * Временный пароль возвращается один раз и только при создании новой учётной
 * записи: система его не хранит и повторно показать не сможет.  — либо
 * заявка привязана к существующему профилю, либо Keycloak был недоступен.
 */
export interface ApplicationApprovalResult {
  application: RegistrationApplicationDto;
  temporaryPassword: string | null;
}

/**
 * Состояние заявки для самого заявителя.
 *
 * Отдаётся по идентификатору без авторизации, поэтому содержит только то, что
 * заявитель и так о себе знает, плюс решение по заявке. Кто рассматривал и с
 * кем система нашла совпадение — не раскрывается.
 */
export interface ApplicationStatusDto {
  fullName: string;
  subject: { code: string; name: string; shortName: string };
  desiredPosition: string;
  status: ApplicationStatus;
  reviewComment: string | null;
  submittedAt: string;
  reviewedAt: string | null;
}

export interface ApplicationListResponse {
  items: RegistrationApplicationDto[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  pendingCount: number;
}
