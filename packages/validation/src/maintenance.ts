import { ROLES } from '@femida/types';
import { z } from 'zod';

const nullableText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullish()
    .transform((value) => (value && value.length > 0 ? value : null));

/** Обновление режима технических работ. ADMIN всегда сохраняет доступ. */
export const updateMaintenanceSchema = z
  .object({
    enabled: z.boolean(),
    title: nullableText(191),
    message: nullableText(2000),
    plannedCompletionAt: z
      .string()
      .datetime()
      .nullish()
      .transform((value) => value ?? null),
    allowedRoles: z.array(z.enum(ROLES)).default(['ADMIN']),
  })
  .transform((value) => ({
    ...value,
    // ADMIN не может потерять доступ: иначе режим невозможно отключить.
    allowedRoles: [...new Set([...value.allowedRoles, 'ADMIN' as const])],
  }));

export type UpdateMaintenanceInput = z.infer<typeof updateMaintenanceSchema>;
