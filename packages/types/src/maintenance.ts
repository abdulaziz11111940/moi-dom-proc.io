/** Режим технических работ (администрирование). */
import { type Role } from './roles';

export const MAINTENANCE_MANAGE_MIN_ROLE: Role = 'ADMIN';

/** Полные параметры режима технических работ (для администратора). */
export interface MaintenanceSettingDto {
  enabled: boolean;
  title: string | null;
  message: string | null;
  plannedCompletionAt: string | null;
  /** Роли, сохраняющие доступ при включённом режиме. ADMIN присутствует всегда. */
  allowedRoles: Role[];
}
