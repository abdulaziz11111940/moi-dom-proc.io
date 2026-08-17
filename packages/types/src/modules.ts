/**
 * Статус готовности модуля системы.
 * AVAILABLE       — модуль подключён и выполняет рабочие операции;
 * IN_DEVELOPMENT  — доступна только структура интерфейса без рабочих операций;
 * PLANNED         — модуль запланирован, интерфейс ещё не создан.
 */
export const MODULE_STATUSES = ['AVAILABLE', 'IN_DEVELOPMENT', 'PLANNED'] as const;
export type ModuleStatus = (typeof MODULE_STATUSES)[number];

export const MODULE_STATUS_LABEL: Record<ModuleStatus, string> = {
  AVAILABLE: 'Доступен',
  IN_DEVELOPMENT: 'В разработке',
  PLANNED: 'Запланирован',
};

/** Этапы развития системы, на которые ссылаются заглушки модулей. */
export const DEVELOPMENT_STAGES = [
  'Этап 1. Инфраструктура',
  'Этап 2. Дизайн-система',
  'Этап 3. Маршруты и заглушки',
  'Этап 4. Авторизация',
  'Этап 5. Минимальный backend',
  'Этап 6. Проверка качества',
  'Этап 7. Сотрудники и штат',
  'Этап 8. Дела и обращения',
  'Этап 9. Проверки',
  'Этап 10. Служебные модули',
  'Этап 11. Аналитика',
  'Этап 12. Администрирование',
] as const;

export type DevelopmentStage = (typeof DEVELOPMENT_STAGES)[number];
