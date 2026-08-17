import { describe, expect, it } from 'vitest';

import {
  canTransitionInspection,
  INSPECTION_ACTIONS,
  INSPECTION_STATUS_TRANSITIONS,
  INSPECTION_STATUSES,
} from './inspections';

describe('переходы статусов проверки', () => {
  it('жизненный цикл идёт запланирована → активна → завершена → на утверждении → утверждена', () => {
    expect(canTransitionInspection('PLANNED', 'ACTIVE')).toBe(true);
    expect(canTransitionInspection('ACTIVE', 'COMPLETED')).toBe(true);
    expect(canTransitionInspection('COMPLETED', 'PENDING_APPROVAL')).toBe(true);
    expect(canTransitionInspection('PENDING_APPROVAL', 'APPROVED')).toBe(true);
  });

  it('нельзя перескочить через этап', () => {
    expect(canTransitionInspection('PLANNED', 'APPROVED')).toBe(false);
    expect(canTransitionInspection('ACTIVE', 'APPROVED')).toBe(false);
    expect(canTransitionInspection('PLANNED', 'COMPLETED')).toBe(false);
  });

  it('утверждённая и отменённая — терминальные', () => {
    expect(INSPECTION_STATUS_TRANSITIONS.APPROVED).toEqual([]);
    expect(INSPECTION_STATUS_TRANSITIONS.CANCELLED).toEqual([]);
  });

  it('отмена возможна с любого рабочего этапа', () => {
    for (const status of ['PLANNED', 'ACTIVE', 'COMPLETED', 'PENDING_APPROVAL'] as const) {
      expect(canTransitionInspection(status, 'CANCELLED'), status).toBe(true);
    }
  });

  it('переоткрытие возвращает в работу с завершения и утверждения', () => {
    expect(canTransitionInspection('COMPLETED', 'ACTIVE')).toBe(true);
    expect(canTransitionInspection('PENDING_APPROVAL', 'ACTIVE')).toBe(true);
  });

  it('каждое действие ведёт к допустимому целевому статусу', () => {
    // Целевой статус действия должен быть одним из статусов проверки.
    for (const target of Object.values(INSPECTION_ACTIONS)) {
      expect(INSPECTION_STATUSES).toContain(target);
    }
  });
});
