/**
 * Роли ЕИАС «Фемида» в порядке возрастания полномочий.
 * Значения совпадают с enum `Role` в Prisma и с ролями realm `femida` в Keycloak.
 */
export const ROLES = [
  'EMPLOYEE',
  'SENIOR_ASSISTANT',
  'USP',
  'BOSS',
  'FEDERAL',
  'ADMIN',
] as const;

export type Role = (typeof ROLES)[number];

/** Числовой вес роли: используется только для сравнения «не ниже чем». */
export const ROLE_WEIGHT: Record<Role, number> = {
  EMPLOYEE: 10,
  SENIOR_ASSISTANT: 20,
  USP: 30,
  BOSS: 40,
  FEDERAL: 50,
  ADMIN: 60,
};

export const ROLE_LABEL: Record<Role, string> = {
  EMPLOYEE: 'Сотрудник',
  SENIOR_ASSISTANT: 'Старший помощник',
  USP: 'USP',
  BOSS: 'Руководитель',
  FEDERAL: 'Федеральный уровень',
  ADMIN: 'Администратор',
};

export const ROLE_DESCRIPTION: Record<Role, string> = {
  EMPLOYEE: 'Базовый доступ к рабочим разделам в пределах своего субъекта.',
  SENIOR_ASSISTANT: 'Расширенные рабочие полномочия и дополнительные отчёты своего субъекта.',
  USP: 'Промежуточная управленческая роль с доступом к рабочим реестрам субъекта.',
  BOSS: 'Управление сотрудниками и процессами своего округа.',
  FEDERAL: 'Межрегиональные процессы и сводная аналитика по всем субъектам.',
  ADMIN: 'Полный доступ, включая технические и системные операции.',
};

/**
 * Область действия назначения роли.
 * SUBJECT — в пределах одного субъекта, GLOBAL — все субъекты, SYSTEM — система целиком.
 */
export const SCOPE_TYPES = ['SUBJECT', 'GLOBAL', 'SYSTEM'] as const;
export type ScopeType = (typeof SCOPE_TYPES)[number];

export function isRole(value: string): value is Role {
  return (ROLES as readonly string[]).includes(value);
}

/** Проверка «роль не ниже требуемой» по весу. */
export function isRoleAtLeast(role: Role, required: Role): boolean {
  return ROLE_WEIGHT[role] >= ROLE_WEIGHT[required];
}
