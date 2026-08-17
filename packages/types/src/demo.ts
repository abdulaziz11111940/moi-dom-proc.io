import { type Role } from './roles';
import { type SubjectCode } from './subjects';

/**
 * Демонстрационный каталог профилей.
 *
 * Используется ТОЛЬКО когда система запущена в режиме `AUTH_MODE=mock`.
 * Это не учётные записи: паролей, хешей и токенов здесь нет, записи не
 * создаются в Keycloak и не считаются реальными сотрудниками.
 *
 * Каталог общий для frontend и backend, чтобы демонстрационный профиль
 * совпадал на обеих сторонах.
 */
export interface DemoUser {
  readonly id: string;
  readonly fullName: string;
  readonly login: string;
  readonly position: string;
  readonly rank: string | null;
  readonly subjectCode: SubjectCode;
  readonly role: Role;
  readonly appointedAt: string;
}

export const DEMO_USERS: readonly DemoUser[] = [
  {
    id: 'demo-admin',
    fullName: 'Челищев Григорий Станиславович',
    login: 'челищев.григорий.станиславович',
    position: 'Начальник организационно-аналитического управления',
    rank: 'Государственный советник юстиции 3-го класса',
    subjectCode: 'GENERAL',
    role: 'ADMIN',
    appointedAt: '2026-03-11',
  },
  {
    id: 'demo-federal',
    fullName: 'Соколовский Артём Игоревич',
    login: 'соколовский.артем.игоревич',
    position: 'Заместитель Генерального прокурора',
    rank: 'Государственный советник юстиции 2 класса',
    subjectCode: 'GENERAL',
    role: 'FEDERAL',
    appointedAt: '2026-03-14',
  },
  {
    id: 'demo-boss-kfo',
    fullName: 'Вяземский Никита Дмитриевич',
    login: 'вяземский.никита.дмитриевич',
    position: 'Прокурор субъекта',
    rank: 'Старший советник юстиции',
    subjectCode: 'KUTUZOVSKY',
    role: 'BOSS',
    appointedAt: '2026-03-17',
  },
  {
    id: 'demo-boss-afo',
    fullName: 'Шмидт Александр Сергеевич',
    login: 'шмидт.александр.сергеевич',
    position: 'Прокурор субъекта',
    rank: 'Государственный советник юстиции 2 класса',
    subjectCode: 'ARBATSKY',
    role: 'BOSS',
    appointedAt: '2026-03-11',
  },
  {
    id: 'demo-usp-kfo',
    fullName: 'Гордеев Илья Романович',
    login: 'гордеев.илья.романович',
    position: 'Старший прокурор УСБ',
    rank: 'Советник юстиции',
    subjectCode: 'KUTUZOVSKY',
    role: 'USP',
    appointedAt: '2026-04-02',
  },
  {
    id: 'demo-senior-kfo',
    fullName: 'Мартьянов Дмитрий Сергеевич',
    login: 'мартьянов.дмитрий.сергеевич',
    position: 'Старший помощник прокурора',
    rank: 'Младший советник юстиции',
    subjectCode: 'KUTUZOVSKY',
    role: 'SENIOR_ASSISTANT',
    appointedAt: '2026-03-19',
  },
  {
    id: 'demo-employee-kfo',
    fullName: 'Акрапович Илья Олегович',
    login: 'акрапович.илья.олегович',
    position: 'Помощник прокурора',
    rank: 'Юрист 1 класса',
    subjectCode: 'KUTUZOVSKY',
    role: 'EMPLOYEE',
    appointedAt: '2026-03-16',
  },
];

/** Профиль, который используется по умолчанию в демонстрационном режиме. */
export const DEFAULT_DEMO_USER_ID = 'demo-admin';

export function findDemoUserById(id: string): DemoUser | undefined {
  return DEMO_USERS.find((user) => user.id === id);
}

/**
 * Поиск демонстрационного профиля по ФИО.
 * Сравнение выполняется по нормализованному значению: лишние пробелы убраны,
 * регистр приведён к нижнему, «ё» приведена к «е».
 */
export function findDemoUserByFullName(fullName: string): DemoUser | undefined {
  const normalize = (value: string): string =>
    value.trim().replace(/\s+/g, ' ').replace(/ё/gi, 'е').toLowerCase();
  const target = normalize(fullName);
  return DEMO_USERS.find((user) => normalize(user.fullName) === target);
}
