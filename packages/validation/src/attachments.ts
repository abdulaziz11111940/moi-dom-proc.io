import { ATTACHMENT_CATEGORIES } from '@femida/types';
import { z } from 'zod';

const titleSchema = z
  .string({ required_error: 'Укажите название вложения' })
  .trim()
  .min(3, 'Название должно содержать не менее 3 символов')
  .max(255, 'Название не должно превышать 255 символов');

const descriptionSchema = z
  .string()
  .trim()
  .max(1000, 'Описание не должно превышать 1000 символов')
  .optional()
  .or(z.literal(''));

/**
 * Адрес внешнего материала.
 *
 * Допускаются только схемы http и https: иные схемы (`javascript:`, `data:`,
 * `file:`) позволяют выполнить код в браузере пользователя или обратиться
 * к локальным ресурсам.
 */
export const attachmentUrlSchema = z
  .string({ required_error: 'Укажите ссылку на материал' })
  .trim()
  .min(8, 'Ссылка слишком короткая')
  .max(2048, 'Ссылка не должна превышать 2048 символов')
  .refine((value) => {
    try {
      const url = new URL(value);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  }, 'Ссылка должна начинаться с http:// или https://');

/** Приложение материала ссылкой. */
export const createLinkAttachmentSchema = z.object({
  category: z.enum(ATTACHMENT_CATEGORIES).default('OTHER'),
  title: titleSchema,
  description: descriptionSchema,
  url: attachmentUrlSchema,
});

export type CreateLinkAttachmentInput = z.infer<typeof createLinkAttachmentSchema>;

/**
 * Сведения, сопровождающие загрузку файла.
 * Приходят в multipart-запросе, поэтому значения проверяются как строки.
 */
export const createFileAttachmentSchema = z.object({
  category: z.enum(ATTACHMENT_CATEGORIES).default('OTHER'),
  title: titleSchema,
  description: descriptionSchema,
});

export type CreateFileAttachmentInput = z.infer<typeof createFileAttachmentSchema>;
