import { z } from 'zod';

/**
 * Нормализация ФИО для поиска учётной записи.
 * Keycloak оперирует username, поэтому ФИО приводится к устойчивому виду:
 * убираются лишние пробелы, регистр приводится к нижнему, «ё» приводится к «е».
 */
export function normalizeFullName(value: string): string {
  return value
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/ё/gi, 'е')
    .toLowerCase();
}

/**
 * Формирование технического идентификатора (username) из ФИО.
 * Пример: «Челищев Григорий Станиславович» -> «chelishchev.grigorii.stanislavovich»
 * не выполняется здесь: транслитерация относится к слою интеграции с Keycloak.
 * Здесь формируется только детерминированный ключ поиска.
 */
export function fullNameLookupKey(value: string): string {
  return normalizeFullName(value).replace(/\s/g, '_');
}

const FULL_NAME_PATTERN = /^[А-Яа-яЁёA-Za-z\-' ]+$/u;

export const fullNameSchema = z
  .string({ required_error: 'Укажите ФИО' })
  .trim()
  .min(5, 'ФИО должно содержать не менее 5 символов')
  .max(120, 'ФИО не должно превышать 120 символов')
  .regex(FULL_NAME_PATTERN, 'ФИО может содержать только буквы, пробел, дефис и апостроф')
  .refine(
    (value) => value.trim().split(/\s+/).length >= 2,
    'Укажите как минимум фамилию и имя',
  );

export const passwordSchema = z
  .string({ required_error: 'Укажите пароль' })
  .min(8, 'Пароль должен содержать не менее 8 символов')
  .max(128, 'Пароль не должен превышать 128 символов')
  .regex(/[A-Za-zА-Яа-яЁё]/u, 'Пароль должен содержать хотя бы одну букву')
  .regex(/\d/u, 'Пароль должен содержать хотя бы одну цифру');

export const discordIdSchema = z
  .string({ required_error: 'Укажите Discord ID' })
  .trim()
  .regex(/^\d{17,20}$/u, 'Discord ID — числовой идентификатор длиной 17–20 цифр');

export const positionSchema = z
  .string({ required_error: 'Укажите должность' })
  .trim()
  .min(3, 'Название должности слишком короткое')
  .max(150, 'Название должности не должно превышать 150 символов');

export const uuidSchema = z.string().uuid('Ожидается идентификатор в формате UUID');
