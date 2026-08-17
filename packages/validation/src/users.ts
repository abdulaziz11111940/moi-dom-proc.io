import { MIN_PASSWORD_LENGTH } from '@femida/types';
import { z } from 'zod';

import { discordIdSchema } from './common';

/** Изменение собственного профиля — только поля, не требующие полномочий кадровика. */
export const updateOwnProfileSchema = z.object({
  discordId: discordIdSchema.optional().or(z.literal('')),
  contactInfo: z
    .string()
    .trim()
    .max(512, 'Контактные сведения не должны превышать 512 символов')
    .optional()
    .or(z.literal('')),
  showInfoNotifications: z.boolean().optional(),
});

export type UpdateOwnProfileInput = z.infer<typeof updateOwnProfileSchema>;

/**
 * Смена собственного пароля.
 *
 * Текущий пароль обязателен: сервер проверяет его отдельным входом, поэтому
 * перехваченная сессия не позволяет закрепиться в учётной записи.
 */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Введите текущий пароль'),
    // Требования обязаны совпадать с политикой realm Keycloak: иначе пароль
    // проходит проверку в форме и отклоняется при сохранении, а пользователь
    // видит непонятный отказ уже после отправки.
    newPassword: z
      .string()
      .min(MIN_PASSWORD_LENGTH, `Пароль должен содержать не менее ${MIN_PASSWORD_LENGTH} символов`)
      .max(128, 'Пароль не должен превышать 128 символов')
      .regex(/\d/u, 'Пароль должен содержать хотя бы одну цифру')
      .regex(/\p{L}/u, 'Пароль должен содержать хотя бы одну букву'),
    confirmation: z.string(),
  })
  .refine((value) => value.newPassword === value.confirmation, {
    message: 'Пароли не совпадают',
    path: ['confirmation'],
  })
  .refine((value) => value.newPassword !== value.currentPassword, {
    message: 'Новый пароль должен отличаться от текущего',
    path: ['newPassword'],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
