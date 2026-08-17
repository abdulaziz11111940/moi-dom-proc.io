import { z } from 'zod';

export const notificationListQuerySchema = z.object({
  unreadOnly: z.coerce.boolean().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(30),
});

export type NotificationListQueryInput = z.infer<typeof notificationListQuerySchema>;
