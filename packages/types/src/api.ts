import { type Role, type ScopeType } from './roles';

/** Единый формат ошибки REST API ЕИАС «Фемида». */
export interface ApiErrorResponse {
  statusCode: number;
  code: string;
  message: string;
  details: Record<string, unknown>;
  correlationId: string;
  timestamp: string;
}

/** Состояние отдельной инфраструктурной зависимости. */
export const SERVICE_STATES = ['up', 'down', 'disabled'] as const;
export type ServiceState = (typeof SERVICE_STATES)[number];

export interface ServiceHealth {
  name: string;
  status: ServiceState;
  message?: string;
  latencyMs?: number;
}

export interface HealthResponse {
  status: 'ok' | 'degraded' | 'error';
  uptimeSeconds: number;
  timestamp: string;
  version: string;
  services: ServiceHealth[];
}

/**
 * Ответ `/system/status`.
 * Поле `isDemo` явно указывает, что данные являются демонстрационными.
 */
export interface SystemStatusResponse {
  mode: string;
  isDemo: boolean;
  message: string;
  version: string;
  environment: string;
  authMode: 'mock' | 'keycloak';
  maintenance: {
    enabled: boolean;
    title: string | null;
    message: string | null;
    plannedCompletionAt: string | null;
  };
  services: ServiceHealth[];
  timestamp: string;
}

/** Назначение роли с областью действия. */
export interface RoleAssignmentDto {
  role: Role;
  scopeType: ScopeType;
  scopeSubjectCode: string | null;
  validFrom: string;
  validTo: string | null;
}

/** Профиль текущего пользователя (`GET /me`). */
export interface CurrentUserDto {
  id: string;
  fullName: string;
  discordId: string | null;
  position: string;
  rank: string | null;
  subject: {
    code: string;
    name: string;
    shortName: string;
  };
  primaryRole: Role;
  roleAssignments: RoleAssignmentDto[];
  status: string;
  appointedAt: string | null;
  /** Временная ссылка на скачивание — уже разрешённая из ключа объекта. */
  avatarUrl: string | null;
  contactInfo: string | null;
  showInfoNotifications: boolean;
  /** Выдан временный пароль: работа в системе начинается после его смены. */
  mustChangePassword: boolean;
  /** true — профиль получен из демонстрационного каталога, а не из Keycloak/БД. */
  isDemo: boolean;
}

/**
 * Минимальная длина пароля, требуемая интерфейсом.
 *
 * Строже политики realm Keycloak (`length(8) and digits(1)`): она задаёт
 * нижнюю границу для всех способов входа, а здесь запас сделан осознанно.
 * Ослаблять это значение до восьми нельзя — политику realm приложение не
 * читает и на неё не опирается.
 */
export const MIN_PASSWORD_LENGTH = 10;

/** Событие журнала входов Keycloak. */
export interface LoginHistoryEntryDto {
  type: string;
  ipAddress: string | null;
  at: string;
  error: string | null;
}

export const LOGIN_EVENT_LABEL: Record<string, string> = {
  LOGIN: 'Вход выполнен',
  LOGIN_ERROR: 'Неудачная попытка входа',
  LOGOUT: 'Выход из системы',
};

/** Состояние раздела «Пароль и сессии». */
export interface AccountSecurityDto {
  /** Управление доступно только при подключённом Keycloak. */
  managed: boolean;
  activeSessions: number;
  history: LoginHistoryEntryDto[];
}

export const MAX_AVATAR_SIZE_BYTES = 2 * 1024 * 1024;

export const ALLOWED_AVATAR_MIME_TYPES: readonly string[] = [
  'image/jpeg',
  'image/png',
  'image/webp',
];

export function isAllowedAvatarMimeType(mimeType: string): boolean {
  return ALLOWED_AVATAR_MIME_TYPES.includes(mimeType.toLowerCase());
}

/** Обёртка постраничного ответа. */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
