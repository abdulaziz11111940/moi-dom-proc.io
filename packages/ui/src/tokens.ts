/**
 * Палитра ЕИАС «Фемида».
 * Единственный источник цветов системы: значения не дублируются в компонентах,
 * а подключаются через Tailwind-тему (`femidaThemeColors`) и CSS-переменные.
 */
export const femidaPalette = {
  /** Основной фон приложения. */
  background: '#07162f',
  /** Фон карточек и панелей. */
  surface: '#0d2247',
  /** Фон боковой навигации. */
  sidebar: '#091834',
  /** Фон полей ввода. */
  input: '#14305f',
  /** Цвет границ. */
  border: '#174b98',
  /** Активный элемент навигации и управления. */
  active: '#2a67c4',
  /** Золотой акцент. */
  gold: '#d5b060',
  /** Тёмное золото. */
  goldDark: '#8a661f',
  /** Светлое золото. */
  goldLight: '#f0d38a',
  /** Основной текст. */
  foreground: '#f4f7ff',
  /** Вторичный текст. */
  foregroundSecondary: '#d4def4',
  /** Приглушённый текст. */
  foregroundMuted: '#90a8cf',
  /** Синий акцент. */
  accent: '#245fb3',
  /** Светлый синий. */
  accentLight: '#5f8fda',
} as const;

export type FemidaPaletteKey = keyof typeof femidaPalette;

/**
 * Служебные цвета состояний.
 * Подобраны так, чтобы сохранять контраст на фоне `background` и `surface`.
 */
export const femidaStatusPalette = {
  success: '#3fae7a',
  successSoft: '#123a2c',
  warning: '#d8a33c',
  warningSoft: '#3b2e10',
  danger: '#d9534f',
  dangerLight: '#ff8a86',
  dangerSoft: '#3d1917',
  info: '#5f8fda',
  infoSoft: '#12294d',
  neutral: '#90a8cf',
  neutralSoft: '#132a4f',
} as const;

/** Цвета для подключения в `theme.extend.colors` конфигурации Tailwind. */
export const femidaThemeColors = {
  femida: {
    bg: femidaPalette.background,
    surface: femidaPalette.surface,
    sidebar: femidaPalette.sidebar,
    input: femidaPalette.input,
    border: femidaPalette.border,
    active: femidaPalette.active,
    gold: femidaPalette.gold,
    'gold-dark': femidaPalette.goldDark,
    'gold-light': femidaPalette.goldLight,
    fg: femidaPalette.foreground,
    'fg-secondary': femidaPalette.foregroundSecondary,
    'fg-muted': femidaPalette.foregroundMuted,
    accent: femidaPalette.accent,
    'accent-light': femidaPalette.accentLight,
    success: femidaStatusPalette.success,
    'success-soft': femidaStatusPalette.successSoft,
    warning: femidaStatusPalette.warning,
    'warning-soft': femidaStatusPalette.warningSoft,
    danger: femidaStatusPalette.danger,
    'danger-light': femidaStatusPalette.dangerLight,
    'danger-soft': femidaStatusPalette.dangerSoft,
    info: femidaStatusPalette.info,
    'info-soft': femidaStatusPalette.infoSoft,
    neutral: femidaStatusPalette.neutral,
    'neutral-soft': femidaStatusPalette.neutralSoft,
  },
} as const;

/** Радиусы, тени и прочие токены оформления. */
export const femidaThemeTokens = {
  borderRadius: {
    femida: '0.5rem',
    'femida-lg': '0.75rem',
  },
  boxShadow: {
    femida: '0 1px 2px 0 rgb(3 10 24 / 0.6), 0 1px 3px 1px rgb(3 10 24 / 0.4)',
    'femida-lg': '0 10px 30px -10px rgb(3 10 24 / 0.8)',
  },
} as const;
