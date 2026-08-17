/** Системные параметры (администрирование). */
import { type AppealStatus } from './appeals';
import { type Role } from './roles';

export const SETTINGS_MANAGE_MIN_ROLE: Role = 'ADMIN';

export type AppealStatusPingSettings = Partial<Record<AppealStatus, string[]>>;
export type SubjectAppealStatusPingSettings = Partial<Record<string, AppealStatusPingSettings>>;

/** Редактируемые операционные параметры системы. */
export interface SystemSettingsDto {
  /** Предельный срок регистрации обращения, часов. */
  appealRegistrationDeadlineHours: number;
  /** Контрольный срок принятия решения по обращению, часов. */
  appealDecisionDeadlineHours: number;
  /**
   * Ограничение размера вложения, МБ (только для сведения).
   * Задаётся при развёртывании и не изменяется на лету.
  */
  attachmentMaxSizeMb: number;
  appealStatusPingDiscordIds: SubjectAppealStatusPingSettings;
}
