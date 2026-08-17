import { type Role } from './roles';
import { type SubjectCode } from './subjects';

/**
 * Соответствие данных действующей (легаси) системы модели ЕИАС «Фемида».
 *
 * Источник: дамп `localhost.sql`, ключ `femida_store.db` (JSON-хранилище легаси).
 * Сводка справочных значений: `infrastructure/legacy/legacy-reference.json`.
 *
 * Таблицы ниже используются только слоем миграции. Рабочая модель системы
 * оперирует кодами `Role` и `SubjectCode`, а не текстовыми названиями.
 */

/**
 * Роли легаси-системы -> роли ЕИАС «Фемида».
 *
 * ВНИМАНИЕ. В легаси семь ролей, в ЕИАС «Фемида» — шесть.
 * «Прокурор субъекта» (руководитель округа) и «Руководитель» (начальник отдела)
 * сведены в одну роль BOSS. Различие сохраняется в должности сотрудника.
 * Отображение подлежит подтверждению перед миграцией данных.
 */
export const LEGACY_ROLE_TO_ROLE: Readonly<Record<string, Role>> = {
  Сотрудник: 'EMPLOYEE',
  'Старший помощник': 'SENIOR_ASSISTANT',
  'Прокурор УСБ': 'USP',
  Руководитель: 'BOSS',
  'Прокурор субъекта': 'BOSS',
  'Федеральный уровень': 'FEDERAL',
  Администратор: 'ADMIN',
};

/** Названия субъектов легаси-системы -> коды субъектов ЕИАС «Фемида». */
export const LEGACY_SUBJECT_TO_CODE: Readonly<Record<string, SubjectCode>> = {
  'Генеральная прокуратура': 'GENERAL',
  'Рублевский Федеральный Округ (РФО)': 'RUBLEVSKY',
  'Рублёвский Федеральный Округ (РФО)': 'RUBLEVSKY',
  Рублёвка: 'RUBLEVSKY',
  'Арбатский Федеральный Округ (АФО)': 'ARBATSKY',
  Арбат: 'ARBATSKY',
  'Патриарший Федеральный Округ (ПФО)': 'PATRIARSHY',
  Патрики: 'PATRIARSHY',
  'Тверской Федеральный Округ (ТФО)': 'TVERSKOY',
  Тверской: 'TVERSKOY',
  'Кутузовский Федеральный Округ (КФО)': 'KUTUZOVSKY',
  Кутузовский: 'KUTUZOVSKY',
};

/** Статусы учётной записи легаси-системы. */
export const LEGACY_USER_STATUS_TO_STATUS: Readonly<Record<string, string>> = {
  active: 'ACTIVE',
  archived: 'DISMISSED',
  blocked: 'BLOCKED',
};

/** Статусы заявки на регистрацию в легаси-системе. */
export const LEGACY_APPLICATION_STATUS: Readonly<Record<string, string>> = {
  pending: 'PENDING',
  approved: 'APPROVED',
  rejected: 'REJECTED',
};

/**
 * Формат логина легаси-системы: ФИО в нижнем регистре через точки,
 * буква «ё» сохраняется. Пример: «челищев.григорий.станиславович».
 *
 * Используется для сопоставления учётных записей при миграции.
 * Для устойчивого поиска в ЕИАС «Фемида» дополнительно применяется
 * нормализация с приведением «ё» к «е» (см. `@femida/validation`).
 */
export function legacyLoginFromFullName(fullName: string): string {
  return fullName.trim().replace(/\s+/g, ' ').toLowerCase().split(' ').join('.');
}

/**
 * Алгоритм хеширования паролей легаси-системы.
 * Формат строки: `pbkdf2_sha256$<итерации>$<соль-hex>$<хеш-hex>`.
 * Совместим с провайдером `pbkdf2-sha256` в Keycloak, что позволяет
 * импортировать учётные данные без принудительного сброса паролей.
 */
export const LEGACY_PASSWORD_ALGORITHM = 'pbkdf2_sha256' as const;
export const LEGACY_PASSWORD_ITERATIONS = 120_000 as const;
