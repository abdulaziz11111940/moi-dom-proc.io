import { describe, expect, it } from 'vitest';

import {
  cancelEkdoOrderSchema,
  createEkdoOrderSchema,
  ekdoOrderQuerySchema,
  updateEkdoOrderSchema,
} from './ekdo';

const baseOrder = {
  targetEmployeeId: '00000000-0000-4000-8000-000000000001',
  title: 'О кадровом решении в отношении сотрудника',
  preamble: 'В соответствии с кадровым регламентом и материалами личного дела.',
  decisionText: 'Назначить сотрудника на указанную должность с установленной даты.',
  reason: 'Представление непосредственного руководителя от 20 июля 2026 года.',
  controlText: 'Контроль за исполнением приказа оставляю за собой.',
  place: 'Москва',
  effectiveAt: '2026-07-23',
};

describe('createEkdoOrderSchema', () => {
  it.each([
    ['HIRING', { position: 'Старший прокурор' }],
    ['APPOINTMENT', { position: 'Прокурор отдела' }],
    [
      'TRANSFER',
      {
        position: 'Прокурор отдела',
        targetSubjectCode: 'KUTUZOVSKY',
        targetSubjectName: 'Кутузовская межрайонная прокуратура',
      },
    ],
    ['RANK_ASSIGNMENT', {}],
    ['SUSPENSION', {}],
    ['DISMISSAL', {}],
    ['AWARD', { awardCode: 'RULE_OF_LAW', awardTitle: 'За укрепление законности' }],
    [
      'BUSINESS_TRIP',
      {
        position: 'Прокурор отдела',
        targetSubjectCode: 'KUTUZOVSKY',
        targetSubjectName: 'Кутузовская межрайонная прокуратура',
        endAt: '2026-07-30',
        tripRole: 'EMPLOYEE',
      },
    ],
  ] as const)('принимает приказ вида %s', (kind, details) => {
    expect(
      createEkdoOrderSchema.safeParse({
        ...baseOrder,
        kind,
        details,
        ...(kind === 'RANK_ASSIGNMENT' ? { targetRank: 'Юрист 3 класса' } : {}),
      }).success,
    ).toBe(true);
  });

  it('проверяет обязательные реквизиты конкретного вида приказа', () => {
    const result = createEkdoOrderSchema.safeParse({
      ...baseOrder,
      kind: 'BUSINESS_TRIP',
      details: { position: 'Прокурор отдела' },
    });
    expect(result.success).toBe(false);
  });

  it('не позволяет завершить командировку раньше даты начала', () => {
    const result = createEkdoOrderSchema.safeParse({
      ...baseOrder,
      kind: 'BUSINESS_TRIP',
      details: {
        position: 'Прокурор отдела',
        targetSubjectCode: 'KUTUZOVSKY',
        endAt: '2026-07-22',
        tripRole: 'EMPLOYEE',
      },
    });
    expect(result.success).toBe(false);
  });

  it('не позволяет выдать системную роль через приказ о командировке', () => {
    const result = createEkdoOrderSchema.safeParse({
      ...baseOrder,
      kind: 'BUSINESS_TRIP',
      details: {
        position: 'Прокурор отдела',
        targetSubjectCode: 'KUTUZOVSKY',
        endAt: '2026-07-30',
        tripRole: 'ADMIN',
      },
    });
    expect(result.success).toBe(false);
  });

  it('принимает ручной номер и версию из внутреннего редактора', () => {
    expect(
      updateEkdoOrderSchema.safeParse({
        ...baseOrder,
        kind: 'APPOINTMENT',
        details: { position: 'Прокурор отдела' },
        manualNumber: '17-к',
        version: 1,
      }).success,
    ).toBe(true);
  });
});

describe('ekdoOrderQuerySchema', () => {
  it('задаёт безопасную пагинацию по умолчанию', () => {
    expect(ekdoOrderQuerySchema.parse({})).toMatchObject({ page: 1, pageSize: 20 });
  });
});

describe('cancelEkdoOrderSchema', () => {
  it('не позволяет отменить приказ без объяснения', () => {
    expect(cancelEkdoOrderSchema.safeParse({ reason: 'нет' }).success).toBe(false);
  });
});
