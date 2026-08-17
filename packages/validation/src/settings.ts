import { z } from 'zod';
import { APPEAL_STATUSES } from '@femida/types';

const discordPingIdsSchema = z
  .array(
    z
      .string()
      .trim()
      .regex(/^\d{15,22}$/u, 'Discord ID должен содержать 15–22 цифры'),
  )
  .max(20);

export const appealStatusPingSettingsSchema = z
  .object(
    Object.fromEntries(APPEAL_STATUSES.map((status) => [status, discordPingIdsSchema])) as Record<
      (typeof APPEAL_STATUSES)[number],
      typeof discordPingIdsSchema
    >,
  )
  .partial();

export const subjectAppealStatusPingSettingsSchema = z.record(
  z.string().trim().min(1).max(64),
  appealStatusPingSettingsSchema,
);

/** Обновление операционных параметров. Размер вложения здесь не меняется. */
export const updateSystemSettingsSchema = z.object({
  appealRegistrationDeadlineHours: z.coerce.number().int().min(1).max(720),
  appealDecisionDeadlineHours: z.coerce.number().int().min(1).max(2160),
  appealStatusPingDiscordIds: subjectAppealStatusPingSettingsSchema.optional(),
});

export type UpdateSystemSettingsInput = z.infer<typeof updateSystemSettingsSchema>;
