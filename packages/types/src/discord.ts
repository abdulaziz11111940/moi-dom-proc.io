import { type SubjectCode } from './subjects';

export const DISCORD_NOTIFICATION_EVENTS = [
  'TEST',
  'APPEAL_CREATED',
  'APPEAL_ASSIGNED',
  'APPEAL_STATUS_CHANGED',
  'APPEAL_DEADLINE_EXTENDED',
  'APPEAL_COMMENT_ADDED',
  'EKDO_ORDER_REGISTERED',
] as const;

export type DiscordNotificationEvent = (typeof DISCORD_NOTIFICATION_EVENTS)[number];

export interface DiscordDeliveryDto {
  id: string;
  event: DiscordNotificationEvent;
  subjectCode: string | null;
  entityType: string | null;
  entityId: string | null;
  status: 'SENT' | 'FAILED' | 'SKIPPED';
  httpStatus: number | null;
  error: string | null;
  createdAt: string;
  deliveredAt: string | null;
}

export interface DiscordIntegrationStatusDto {
  enabled: boolean;
  testMode: boolean;
  forumMode: boolean;
  activeThreads: number;
  configuredSubjects: SubjectCode[];
  missingSubjects: SubjectCode[];
  defaultWebhookConfigured: boolean;
  deliveries: DiscordDeliveryDto[];
}
