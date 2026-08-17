import { SUBJECT_CODES } from '@femida/types';
import { z } from 'zod';

import { discordIdSchema, fullNameSchema, passwordSchema, positionSchema } from './common';

/** Схема формы входа: ФИО + пароль. */
export const loginSchema = z.object({
  fullName: fullNameSchema,
  password: z
    .string({ required_error: 'Укажите пароль' })
    .min(1, 'Укажите пароль')
    .max(128, 'Пароль не должен превышать 128 символов'),
  rememberMe: z.boolean().optional().default(false),
});

export type LoginInput = z.infer<typeof loginSchema>;

const subjectCodeSchema = z.enum(SUBJECT_CODES, {
  errorMap: () => ({ message: 'Выберите субъект из справочника' }),
});

/**
 * Заявка на регистрацию в том виде, в каком её принимает сервер.
 *
 * Пароль проверяется на входе как часть формы, но не хранится в заявке:
 * учётная запись создаётся только после одобрения.
 */
const submitApplicationBaseSchema = z.object({
  fullName: fullNameSchema,
  discordId: discordIdSchema,
  subjectCode: subjectCodeSchema,
  desiredPosition: positionSchema,
  password: passwordSchema,
  passwordConfirmation: passwordSchema,
  comment: z
    .string()
    .trim()
    .max(1000, 'Комментарий не должен превышать 1000 символов')
    .optional()
    .or(z.literal('')),
});

function validatePasswordConfirmation(
  value: { password: string; passwordConfirmation: string },
  context: z.RefinementCtx,
): void {
  if (value.password !== value.passwordConfirmation) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['passwordConfirmation'],
      message: 'Пароли не совпадают',
    });
  }
}

export const submitApplicationSchema = submitApplicationBaseSchema.superRefine(
  validatePasswordConfirmation,
);

export type SubmitApplicationInput = z.infer<typeof submitApplicationSchema>;

/** Схема формы заявки: то же плюс подтверждение о назначении системы. */
export const registrationSchema = submitApplicationBaseSchema
  .extend({
    acceptDisclaimer: z.literal(true, {
      errorMap: () => ({ message: 'Подтвердите ознакомление с назначением системы' }),
    }),
  })
  .superRefine(validatePasswordConfirmation);

export type RegistrationInput = z.infer<typeof registrationSchema>;
