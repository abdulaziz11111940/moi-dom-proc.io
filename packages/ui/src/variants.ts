import {
  type AppealPriority,
  type AppealStatus,
  type ApplicationStatus,
  type ModuleStatus,
  type Role,
} from '@femida/types';

/**
 * Наборы классов Tailwind для статусных элементов интерфейса.
 * Классы описаны строками целиком, без конкатенации, — иначе Tailwind
 * не находит их при сканировании исходников.
 */

export const roleBadgeClasses: Record<Role, string> = {
  EMPLOYEE: 'border-femida-border bg-femida-neutral-soft text-femida-fg-secondary',
  SENIOR_ASSISTANT: 'border-femida-accent/60 bg-femida-info-soft text-femida-accent-light',
  USP: 'border-femida-accent/60 bg-femida-info-soft text-femida-accent-light',
  BOSS: 'border-femida-gold-dark bg-femida-gold-dark/25 text-femida-gold-light',
  FEDERAL: 'border-femida-gold bg-femida-gold-dark/35 text-femida-gold-light',
  ADMIN: 'border-femida-danger/60 bg-femida-danger-soft text-femida-danger-light',
};

export const moduleStatusClasses: Record<ModuleStatus, string> = {
  AVAILABLE: 'border-femida-success/50 bg-femida-success-soft text-femida-success',
  IN_DEVELOPMENT: 'border-femida-warning/50 bg-femida-warning-soft text-femida-warning',
  PLANNED: 'border-femida-border bg-femida-neutral-soft text-femida-fg-muted',
};

export const applicationStatusClasses: Record<ApplicationStatus, string> = {
  PENDING: 'border-femida-warning/50 bg-femida-warning-soft text-femida-warning',
  NEEDS_CLARIFICATION: 'border-femida-info/50 bg-femida-info-soft text-femida-accent-light',
  APPROVED: 'border-femida-success/50 bg-femida-success-soft text-femida-success',
  REJECTED: 'border-femida-danger/50 bg-femida-danger-soft text-femida-danger-light',
  WITHDRAWN: 'border-femida-border bg-femida-neutral-soft text-femida-fg-muted',
};

export const appealStatusClasses: Record<AppealStatus, string> = {
  DRAFT: 'border-femida-border bg-femida-neutral-soft text-femida-fg-muted',
  REGISTERED: 'border-femida-info/50 bg-femida-info-soft text-femida-accent-light',
  IN_REVIEW: 'border-femida-info/50 bg-femida-info-soft text-femida-accent-light',
  ASSIGNED: 'border-femida-accent/60 bg-femida-info-soft text-femida-accent-light',
  IN_PROGRESS: 'border-femida-gold-dark bg-femida-gold-dark/25 text-femida-gold-light',
  WAITING_INFORMATION: 'border-femida-warning/50 bg-femida-warning-soft text-femida-warning',
  UNDER_CONTROL: 'border-femida-warning/50 bg-femida-warning-soft text-femida-warning',
  COMPLETED: 'border-femida-success/50 bg-femida-success-soft text-femida-success',
  CLOSED: 'border-femida-success/40 bg-femida-success-soft/70 text-femida-success',
  // Решения по статье 3.1 Регламента: рассмотрение завершается
  // без разрешения по существу.
  REJECTED: 'border-femida-danger/50 bg-femida-danger-soft text-femida-danger-light',
  TRANSFERRED_UP: 'border-femida-accent/60 bg-femida-info-soft text-femida-accent-light',
  TRANSFERRED_EXTERNAL: 'border-femida-accent/60 bg-femida-info-soft text-femida-accent-light',
  TERMINATED: 'border-femida-danger/40 bg-femida-danger-soft/70 text-femida-danger-light',
  MERGED: 'border-femida-border bg-femida-neutral-soft text-femida-fg-secondary',
  RETURNED: 'border-femida-warning/50 bg-femida-warning-soft text-femida-warning',
  ARCHIVED: 'border-femida-border bg-femida-neutral-soft text-femida-fg-muted',
};

export const appealPriorityClasses: Record<AppealPriority, string> = {
  LOW: 'border-femida-border bg-femida-neutral-soft text-femida-fg-muted',
  NORMAL: 'border-femida-border bg-femida-neutral-soft text-femida-fg-secondary',
  HIGH: 'border-femida-warning/50 bg-femida-warning-soft text-femida-warning',
  CRITICAL: 'border-femida-danger/50 bg-femida-danger-soft text-femida-danger-light',
};

/** Общий тон статусной метки, когда конкретный словарь не подходит. */
export const toneClasses = {
  neutral: 'border-femida-border bg-femida-neutral-soft text-femida-fg-secondary',
  info: 'border-femida-info/50 bg-femida-info-soft text-femida-accent-light',
  success: 'border-femida-success/50 bg-femida-success-soft text-femida-success',
  warning: 'border-femida-warning/50 bg-femida-warning-soft text-femida-warning',
  danger: 'border-femida-danger/50 bg-femida-danger-soft text-femida-danger-light',
  gold: 'border-femida-gold-dark bg-femida-gold-dark/25 text-femida-gold-light',
} as const;

export type Tone = keyof typeof toneClasses;
