import globals from 'globals';

import { baseConfig } from './base.js';

/** Конфигурация ESLint для NestJS приложения. */
export const nestConfig = [
  ...baseConfig,
  {
    files: ['**/*.ts'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
    rules: {
      // Декораторы Nest используют пустые классы-DTO и параметры конструктора.
      '@typescript-eslint/no-extraneous-class': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      // Внедрение зависимостей опирается на emitDecoratorMetadata: классы
      // сервисов должны импортироваться как значения, а не как типы.
      '@typescript-eslint/consistent-type-imports': 'off',
    },
  },
];

export default nestConfig;
