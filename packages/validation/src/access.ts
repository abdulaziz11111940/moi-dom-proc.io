import { ROLE_ASSIGNMENT_STATUS_FILTERS, ROLES, SUBJECT_CODES } from '@femida/types';
import { z } from 'zod';

export const roleAssignmentQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(10).max(100).default(30),
  subjectCode: z.enum(SUBJECT_CODES).optional(),
  role: z.enum(ROLES).optional(),
  status: z.enum(ROLE_ASSIGNMENT_STATUS_FILTERS).default('active'),
  search: z.string().trim().max(191).optional(),
});

export type RoleAssignmentQueryInput = z.infer<typeof roleAssignmentQuerySchema>;

/** Назначение дополнительной (не основной) роли сотруднику. */
export const grantRoleAssignmentSchema = z
  .object({
    userProfileId: z.string().uuid(),
    role: z.enum(ROLES),
    /** Обязателен для ролей с областью действия SUBJECT; для FEDERAL/ADMIN игнорируется. */
    scopeSubjectCode: z.enum(SUBJECT_CODES).optional(),
    validTo: z.string().datetime().optional(),
    reason: z
      .string()
      .trim()
      .min(5, 'Основание должно содержать не менее 5 символов')
      .max(512),
  })
  .refine((value) => !value.validTo || new Date(value.validTo).getTime() > Date.now(), {
    message: 'Срок действия должен быть в будущем',
    path: ['validTo'],
  });

export type GrantRoleAssignmentInput = z.infer<typeof grantRoleAssignmentSchema>;

export const revokeRoleAssignmentSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(5, 'Основание должно содержать не менее 5 символов')
    .max(512),
});

export type RevokeRoleAssignmentInput = z.infer<typeof revokeRoleAssignmentSchema>;
