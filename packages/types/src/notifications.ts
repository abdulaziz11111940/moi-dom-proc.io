/**
 * Уведомления пользователя.
 *
 * Адресат хранится жёсткой связью на профиль (в отличие от действующей
 * системы, где `recipient_user_id` был свободной строкой). `actionPageId`
 * определяет переход по клику на карточку уведомления.
 */

export const NOTIFICATION_PRIORITIES = ['INFO', 'WARNING', 'DANGER'] as const;
export type NotificationPriority = (typeof NOTIFICATION_PRIORITIES)[number];

export const NOTIFICATION_PRIORITY_LABEL: Record<NotificationPriority, string> = {
  INFO: 'Информация',
  WARNING: 'Внимание',
  DANGER: 'Важно',
};

/**
 * Тип уведомления о сбое, создаваемого сервером.
 *
 * Вынесен в общий пакет: по нему интерфейс отличает такие уведомления и
 * предлагает скопировать сведения.
 */
export const SYSTEM_ERROR_NOTIFICATION_TYPE = 'SYSTEM_ERROR';

export interface NotificationDto {
  id: string;
  type: string;
  entityType: string;
  entityId: string;
  title: string;
  body: string;
  priority: NotificationPriority;
  actionPageId: string;
  actionPayload: Record<string, unknown> | null;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationListResponse {
  items: NotificationDto[];
  unreadCount: number;
  total: number;
}
