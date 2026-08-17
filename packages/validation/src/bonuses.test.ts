import { describe, expect, it } from 'vitest';

import {
  assignBonusSchema,
  bonusPayoutReportSchema,
  bonusQuerySchema,
  bonusSettingsSchema,
} from './bonuses';

describe('bonusQuerySchema', () => {
  it('булевы фильтры по умолчанию выключены', () => {
    const result = bonusQuerySchema.parse({});
    expect(result.subjectPayoutOnly).toBe(false);
    expect(result.awaitingPayoutOnly).toBe(false);
  });

  it('строка «false» не считается истиной', () => {
    // z.coerce.boolean() превратил бы «false» в true.
    expect(bonusQuerySchema.parse({ subjectPayoutOnly: 'false' }).subjectPayoutOnly).toBe(false);
    expect(bonusQuerySchema.parse({ subjectPayoutOnly: 'true' }).subjectPayoutOnly).toBe(true);
  });
});

describe('bonusPayoutReportSchema', () => {
  it('комментарий необязателен', () => {
    expect(bonusPayoutReportSchema.parse({}).comment).toBeUndefined();
    expect(bonusPayoutReportSchema.safeParse({ comment: '' }).success).toBe(true);
  });

  it('слишком длинный комментарий отклоняется', () => {
    expect(bonusPayoutReportSchema.safeParse({ comment: 'а'.repeat(1001) }).success).toBe(false);
  });
});

describe('bonusSettingsSchema', () => {
  it('принимает частичное изменение', () => {
    expect(bonusSettingsSchema.safeParse({ baseAmount: 60000 }).success).toBe(true);
  });

  it('отклоняет отрицательную базовую сумму', () => {
    expect(bonusSettingsSchema.safeParse({ baseAmount: -1 }).success).toBe(false);
  });

  it('день отчёта ограничен диапазоном 1–31', () => {
    expect(bonusSettingsSchema.safeParse({ reportDeadlineDay: 0 }).success).toBe(false);
    expect(bonusSettingsSchema.safeParse({ reportDeadlineDay: 32 }).success).toBe(false);
    expect(bonusSettingsSchema.safeParse({ reportDeadlineDay: 25 }).success).toBe(true);
  });

  it('время отчёта проверяется по формату ЧЧ:ММ', () => {
    expect(bonusSettingsSchema.safeParse({ reportDeadlineTime: '23:59' }).success).toBe(true);
    expect(bonusSettingsSchema.safeParse({ reportDeadlineTime: '25:00' }).success).toBe(false);
    expect(bonusSettingsSchema.safeParse({ reportDeadlineTime: '9:5' }).success).toBe(false);
  });

  it('принимает настройки режима технических работ', () => {
    // Они хранятся в том же документе, что и настройки премирования.
    const result = bonusSettingsSchema.safeParse({
      maintenanceEnabled: true,
      maintenanceAnnouncement: 'Плановые работы',
    });
    expect(result.success).toBe(true);
  });

  it('день начала периода ограничен диапазоном 1–28', () => {
    expect(bonusSettingsSchema.safeParse({ periodStartDay: 20 }).success).toBe(true);
    expect(bonusSettingsSchema.safeParse({ periodStartDay: 0 }).success).toBe(false);
    expect(bonusSettingsSchema.safeParse({ periodStartDay: 29 }).success).toBe(false);
  });
});

describe('assignBonusSchema', () => {
  const valid = {
    recipientId: 'usr-1',
    baseAmount: 2_500_000,
    coefficient: 1.5,
    reason: 'За высокие показатели надзорной деятельности',
  };

  it('принимает корректное назначение', () => {
    expect(assignBonusSchema.safeParse(valid).success).toBe(true);
  });

  it('требует получателя и основание', () => {
    expect(assignBonusSchema.safeParse({ ...valid, recipientId: '' }).success).toBe(false);
    expect(assignBonusSchema.safeParse({ ...valid, reason: 'кор' }).success).toBe(false);
  });

  it('коэффициент — от 0.25 до 2 с шагом 0.25', () => {
    expect(assignBonusSchema.safeParse({ ...valid, coefficient: 0.25 }).success).toBe(true);
    expect(assignBonusSchema.safeParse({ ...valid, coefficient: 2 }).success).toBe(true);
    expect(assignBonusSchema.safeParse({ ...valid, coefficient: 0.1 }).success).toBe(false);
    expect(assignBonusSchema.safeParse({ ...valid, coefficient: 2.5 }).success).toBe(false);
    // Не по шагу.
    expect(assignBonusSchema.safeParse({ ...valid, coefficient: 1.1 }).success).toBe(false);
  });

  it('отрицательная базовая сумма отклоняется', () => {
    expect(assignBonusSchema.safeParse({ ...valid, baseAmount: -1 }).success).toBe(false);
  });
});
