import { describe, expect, it } from 'vitest';

import {
  BONUS_SETTINGS_DEFAULTS,
  baseAmountForPosition,
  canAssignBonus,
  canDispatchSubjectPayout,
  canEditBonuses,
  canReportPayout,
  effectivePayoutStatus,
  isPayoutPending,
  isPayoutReported,
  isSameSubject,
  isSubjectProsecutor,
  normalizeBonusSettings,
  requiresSubjectPayout,
  resolveReportingPeriod,
  type BonusContext,
  type BonusRecord,
  type LegacyBonusUser,
} from './bonuses';

const positions: BonusContext['positions'] = {
  STAFF: [{ id: 'p-staff', title: 'Помощник прокурора' }],
  SENIOR_STAFF: [{ id: 'p-senior', title: 'Старший помощник прокурора' }],
  USP: [{ id: 'p-usb', title: 'Прокурор СБ' }],
  BOSS: [
    { id: 'p-prosecutor', title: 'Прокурор субъекта' },
    { id: 'p-deputy', title: 'Заместитель прокурора субъекта' },
  ],
  FEDERAL: [{ id: 'p-general', title: 'Генеральный прокурор Российской Федерации' }],
};

function buildContext(users: LegacyBonusUser[]): BonusContext {
  return { users, positions };
}

const KFO = 'Кутузовский Федеральный Округ (КФО)';

function bonus(overrides: Partial<BonusRecord> = {}): BonusRecord {
  return { id: 'bon-1', status: 'approved', subject: KFO, userId: 'u-1', ...overrides };
}

describe('canEditBonuses', () => {
  it('разрешает старшему помощнику, руководителю, федеральному уровню и администратору', () => {
    expect(canEditBonuses('SENIOR_STAFF')).toBe(true);
    expect(canEditBonuses('BOSS')).toBe(true);
    expect(canEditBonuses('FEDERAL')).toBe(true);
    expect(canEditBonuses('ADMIN')).toBe(true);
  });

  it('запрещает рядовому сотруднику и УСБ', () => {
    // УСБ стоит выше старшего помощника, но премии изменять не может:
    // перечень задан списком, а не порогом «не ниже чем».
    expect(canEditBonuses('STAFF')).toBe(false);
    expect(canEditBonuses('USP')).toBe(false);
  });

  it('без роли изменять нельзя', () => {
    expect(canEditBonuses(null)).toBe(false);
    expect(canEditBonuses(undefined)).toBe(false);
  });
});

describe('requiresSubjectPayout: восемь ветвей по порядку', () => {
  it('1. премия не утверждена — выплата округом не требуется', () => {
    const context = buildContext([{ id: 'u-1', role: 'STAFF', subject: KFO }]);

    for (const status of ['pending', 'rejected', 'paid', '', null]) {
      expect(requiresSubjectPayout(bonus({ status }), context), String(status)).toBe(false);
    }
  });

  it('1 важнее 2: неутверждённая премия с включённым контролем всё равно нет', () => {
    const context = buildContext([]);
    expect(requiresSubjectPayout(bonus({ status: 'pending', payoutTracking: true }), context)).toBe(
      false,
    );
  });

  it('2. включённый контроль выплаты сохраняется, даже если остальное против', () => {
    // Получателя нет, округ — Генеральная прокуратура: без контроля был бы «нет».
    const context = buildContext([]);
    const record = bonus({
      payoutTracking: true,
      subject: 'Генеральная прокуратура',
      userId: '',
    });

    expect(requiresSubjectPayout(record, context)).toBe(true);
  });

  it('3. без округа или для Генеральной прокуратуры — нет', () => {
    const context = buildContext([{ id: 'u-1', role: 'STAFF', subject: KFO }]);

    expect(requiresSubjectPayout(bonus({ subject: '' }), context)).toBe(false);
    expect(requiresSubjectPayout(bonus({ subject: null }), context)).toBe(false);
    expect(requiresSubjectPayout(bonus({ subject: 'Генеральная прокуратура' }), context)).toBe(
      false,
    );
    // Сравнение устойчиво к регистру и пробелам.
    expect(requiresSubjectPayout(bonus({ subject: '  генеральная  прокуратура ' }), context)).toBe(
      false,
    );
  });

  it('3 важнее 4: запрос федерального уровня по Генеральной прокуратуре — нет', () => {
    const context = buildContext([]);
    const record = bonus({ subject: 'Генеральная прокуратура', source: 'federal_request' });

    expect(requiresSubjectPayout(record, context)).toBe(false);
  });

  it('4. запрос федерального уровня — да, даже без получателя', () => {
    const context = buildContext([]);
    expect(requiresSubjectPayout(bonus({ source: 'federal_request', userId: '' }), context)).toBe(
      true,
    );
  });

  it('5. получатель не указан или не найден — нет', () => {
    const context = buildContext([{ id: 'другой', role: 'STAFF', subject: KFO }]);

    expect(requiresSubjectPayout(bonus({ userId: '' }), context)).toBe(false);
    expect(requiresSubjectPayout(bonus({ userId: null }), context)).toBe(false);
    expect(requiresSubjectPayout(bonus({ userId: 'u-1' }), context)).toBe(false);
  });

  it('5. получатель ищется и по employeeId, если userId пуст', () => {
    const context = buildContext([{ id: 'u-9', role: 'STAFF', subject: KFO }]);
    const record = bonus({ userId: null, employeeId: 'u-9' });

    expect(requiresSubjectPayout(record, context)).toBe(true);
  });

  it('6. получатель из Генеральной прокуратуры — нет', () => {
    const context = buildContext([
      { id: 'u-1', role: 'STAFF', subject: 'Генеральная прокуратура' },
    ]);

    expect(requiresSubjectPayout(bonus(), context)).toBe(false);
  });

  it('7. рядовой сотрудник округа — да', () => {
    const context = buildContext([{ id: 'u-1', role: 'STAFF', subject: KFO }]);
    expect(requiresSubjectPayout(bonus(), context)).toBe(true);
  });

  it('8. руководитель округа — да, если он не прокурор субъекта', () => {
    const context = buildContext([
      { id: 'u-1', role: 'BOSS', subject: KFO, positionId: 'p-deputy' },
    ]);

    expect(requiresSubjectPayout(bonus(), context)).toBe(true);
  });

  it('8. прокурор субъекта — нет', () => {
    const context = buildContext([
      { id: 'u-1', role: 'BOSS', subject: KFO, positionId: 'p-prosecutor' },
    ]);

    expect(requiresSubjectPayout(bonus(), context)).toBe(false);
  });

  it('8. остальные роли округа — нет', () => {
    for (const role of ['SENIOR_STAFF', 'USP', 'FEDERAL', 'ADMIN']) {
      const context = buildContext([{ id: 'u-1', role, subject: KFO }]);
      expect(requiresSubjectPayout(bonus(), context), role).toBe(false);
    }
  });
});

describe('canReportPayout', () => {
  const prosecutor: LegacyBonusUser = {
    id: 'boss-1',
    role: 'BOSS',
    subject: KFO,
    positionId: 'p-prosecutor',
  };
  const context = buildContext([
    { id: 'u-1', role: 'STAFF', subject: KFO },
    prosecutor,
    { id: 'boss-2', role: 'BOSS', subject: 'Тверской Федеральный Округ (ТФО)', positionId: 'p-prosecutor' },
    { id: 'deputy', role: 'BOSS', subject: KFO, positionId: 'p-deputy' },
    { id: 'admin', role: 'ADMIN', subject: 'Генеральная прокуратура', isSystemAdmin: true },
  ]);

  const pending = bonus({ payoutStatus: 'pending_subject_payout' });

  it('1. по премии без обязательства округа отчитаться нельзя', () => {
    const notRequired = bonus({ status: 'pending', payoutStatus: 'pending_subject_payout' });
    expect(canReportPayout(notRequired, prosecutor, context)).toBe(false);
  });

  it('2. отчитаться можно только после направления в субъект', () => {
    // Направленная (pending) и уже отражённая — можно; ожидающая
    // направления или без обязательства — нельзя.
    expect(canReportPayout(bonus({ payoutStatus: 'not_required' }), prosecutor, context)).toBe(
      false,
    );
    expect(canReportPayout(pending, prosecutor, context)).toBe(true);
    expect(canReportPayout(bonus({ payoutStatus: 'reported' }), prosecutor, context)).toBe(true);
  });

  it('2. по премии, ожидающей направления, отчитаться нельзя', () => {
    // awaiting_subject_dispatch — ещё не этап субъекта: сначала направление
    // Генеральной прокуратурой, затем отчёт.
    const awaiting = bonus({ payoutStatus: 'awaiting_subject_dispatch' });
    expect(canReportPayout(awaiting, prosecutor, context)).toBe(false);

    // Пустой статус при требуемой выплате означает то же — ожидание направления.
    const emptyStatus = bonus({ payoutStatus: null });
    expect(canReportPayout(emptyStatus, prosecutor, context)).toBe(false);
  });

  it('3. системный администратор отчитывается по любому округу', () => {
    const admin = context.users.find((user) => user.id === 'admin') ?? null;
    expect(canReportPayout(pending, admin, context)).toBe(true);
  });

  it('4. не прокурор субъекта отчитаться не может', () => {
    const deputy = context.users.find((user) => user.id === 'deputy') ?? null;
    expect(canReportPayout(pending, deputy, context)).toBe(false);
  });

  it('5. прокурор чужого округа отчитаться не может', () => {
    const other = context.users.find((user) => user.id === 'boss-2') ?? null;
    expect(canReportPayout(pending, other, context)).toBe(false);
  });

  it('без сотрудника отчёт невозможен', () => {
    expect(canReportPayout(pending, null, context)).toBe(false);
  });
});

describe('isSubjectProsecutor', () => {
  it('определяет должность по справочнику, а не по роли', () => {
    const context = buildContext([]);

    expect(
      isSubjectProsecutor(context, { id: 'x', role: 'BOSS', positionId: 'p-prosecutor' }),
    ).toBe(true);
    expect(isSubjectProsecutor(context, { id: 'x', role: 'BOSS', positionId: 'p-deputy' })).toBe(
      false,
    );
    expect(isSubjectProsecutor(context, { id: 'x', role: 'BOSS' })).toBe(false);
  });

  it('находит должность, даже если она числится в другой группе ролей', () => {
    // Роль и группа справочника в перенесённых данных иногда расходятся.
    const context = buildContext([]);
    expect(
      isSubjectProsecutor(context, { id: 'x', role: 'STAFF', positionId: 'p-prosecutor' }),
    ).toBe(true);
  });
});

describe('isSameSubject', () => {
  it('не различает регистр, «ё» и лишние пробелы', () => {
    expect(isSameSubject('Кутузовский  Федеральный Округ (КФО)', KFO)).toBe(true);
  });

  it('пустые значения совпадающими не считаются', () => {
    expect(isSameSubject('', '')).toBe(false);
    expect(isSameSubject(null, undefined)).toBe(false);
  });
});

describe('состояние выплаты', () => {
  it('«ожидает выплаты» — только направленная премия, не ожидающая направления', () => {
    expect(isPayoutPending('pending_subject_payout')).toBe(true);
    // awaiting_subject_dispatch — отдельный этап, не «ожидает выплаты».
    expect(isPayoutPending('awaiting_subject_dispatch')).toBe(false);
    expect(isPayoutPending('not_required')).toBe(false);
    expect(isPayoutReported('reported')).toBe(true);
    expect(isPayoutReported('pending_subject_payout')).toBe(false);
  });
});

describe('effectivePayoutStatus и направление в субъект', () => {
  const context = buildContext([
    { id: 'u-1', role: 'STAFF', subject: KFO },
    { id: 'fed', role: 'FEDERAL', subject: 'Генеральная прокуратура' },
    { id: 'admin', role: 'ADMIN', subject: 'Генеральная прокуратура', isSystemAdmin: true },
    { id: 'boss', role: 'BOSS', subject: KFO, positionId: 'p-prosecutor' },
  ]);
  const fed = context.users.find((u) => u.id === 'fed') ?? null;
  const prosecutor = context.users.find((u) => u.id === 'boss') ?? null;

  it('премия без обязательства округа — «выплата не требуется»', () => {
    expect(effectivePayoutStatus(bonus({ status: 'pending' }), context)).toBe('not_required');
  });

  it('требуется выплата, статус не проставлен — «ожидает направления»', () => {
    expect(effectivePayoutStatus(bonus({ payoutStatus: null }), context)).toBe(
      'awaiting_subject_dispatch',
    );
  });

  it('сохранённые этапы возвращаются как есть', () => {
    expect(effectivePayoutStatus(bonus({ payoutStatus: 'pending_subject_payout' }), context)).toBe(
      'pending_subject_payout',
    );
    expect(effectivePayoutStatus(bonus({ payoutStatus: 'reported' }), context)).toBe('reported');
  });

  it('направлять в субъект может федеральный уровень и администратор', () => {
    const awaiting = bonus({ payoutStatus: null });
    expect(canDispatchSubjectPayout(awaiting, fed, context)).toBe(true);
    expect(
      canDispatchSubjectPayout(awaiting, context.users.find((u) => u.id === 'admin') ?? null, context),
    ).toBe(true);
  });

  it('прокурор субъекта премию в субъект не направляет', () => {
    // Направление — этап Генеральной прокуратуры, а не округа.
    const awaiting = bonus({ payoutStatus: null });
    expect(canDispatchSubjectPayout(awaiting, prosecutor, context)).toBe(false);
  });

  it('уже направленную премию направить повторно нельзя', () => {
    const pending = bonus({ payoutStatus: 'pending_subject_payout' });
    expect(canDispatchSubjectPayout(pending, fed, context)).toBe(false);
  });
});

describe('resolveReportingPeriod', () => {
  it('период начинается 20 числа и длится до 19 числа следующего месяца', () => {
    const period = resolveReportingPeriod(new Date(2026, 6, 23), 20); // 23 июля
    expect(period.key).toBe('2026-07');
    expect(period.label).toBe('20.07.2026 — 19.08.2026');
  });

  it('дата до 20 числа относится к периоду, начавшемуся в прошлом месяце', () => {
    const period = resolveReportingPeriod(new Date(2026, 6, 5), 20); // 5 июля
    expect(period.key).toBe('2026-06');
    expect(period.label).toBe('20.06.2026 — 19.07.2026');
  });

  it('граница периода: 20 число — уже новый период', () => {
    expect(resolveReportingPeriod(new Date(2026, 6, 20), 20).key).toBe('2026-07');
    expect(resolveReportingPeriod(new Date(2026, 6, 19), 20).key).toBe('2026-06');
  });

  it('переход через год', () => {
    const period = resolveReportingPeriod(new Date(2026, 0, 10), 20); // 10 января
    expect(period.key).toBe('2025-12');
    expect(period.label).toBe('20.12.2025 — 19.01.2026');
  });

  it('день начала периода можно изменить', () => {
    expect(resolveReportingPeriod(new Date(2026, 6, 23), 1).key).toBe('2026-07');
    expect(resolveReportingPeriod(new Date(2026, 6, 15), 25).key).toBe('2026-06');
  });
});

describe('baseAmountForPosition', () => {
  it('возвращает базовую сумму по Положению', () => {
    expect(baseAmountForPosition('Прокурор субъекта')).toBe(4_000_000);
    expect(baseAmountForPosition('Помощник прокурора')).toBe(2_500_000);
  });

  it('не различает регистр и «ё»', () => {
    expect(baseAmountForPosition('  прокурор  СУБЪЕКТА ')).toBe(4_000_000);
  });

  it('для должности вне таблицы — null', () => {
    expect(baseAmountForPosition('Дворник')).toBeNull();
    expect(baseAmountForPosition(null)).toBeNull();
  });
});

describe('canAssignBonus', () => {
  it('назначают премии руководитель округа, федеральный уровень и администратор', () => {
    expect(canAssignBonus({ id: 'x', role: 'BOSS' })).toBe(true);
    expect(canAssignBonus({ id: 'x', role: 'FEDERAL' })).toBe(true);
    expect(canAssignBonus({ id: 'x', role: 'ADMIN' })).toBe(true);
  });

  it('старший помощник назначать премии не может', () => {
    // Право у́же круга изменения премий: старший помощник исключён.
    expect(canAssignBonus({ id: 'x', role: 'SENIOR_STAFF' })).toBe(false);
    expect(canAssignBonus({ id: 'x', role: 'STAFF' })).toBe(false);
    expect(canAssignBonus({ id: 'x', role: 'USP' })).toBe(false);
    expect(canAssignBonus(null)).toBe(false);
  });
});

describe('normalizeBonusSettings', () => {
  it('добирает недостающие поля из значений по умолчанию', () => {
    expect(normalizeBonusSettings({})).toEqual(BONUS_SETTINGS_DEFAULTS);
    expect(normalizeBonusSettings(null)).toEqual(BONUS_SETTINGS_DEFAULTS);
    expect(normalizeBonusSettings('строка')).toEqual(BONUS_SETTINGS_DEFAULTS);
  });

  it('отбрасывает посторонние поля', () => {
    const result = normalizeBonusSettings({ baseAmount: 1, лишнее: 'значение' });

    expect(result.baseAmount).toBe(1);
    expect('лишнее' in result).toBe(false);
  });

  it('сохраняет настройки режима технических работ', () => {
    // Настройки техработ живут в этом же объекте — так в действующей системе.
    const result = normalizeBonusSettings({
      maintenanceEnabled: true,
      maintenanceAnnouncement: 'Обновление этапов обращений',
    });

    expect(result.maintenanceEnabled).toBe(true);
    expect(result.maintenanceAnnouncement).toBe('Обновление этапов обращений');
  });

  it('значение неверного типа заменяется значением по умолчанию', () => {
    const result = normalizeBonusSettings({ baseAmount: 'много', approvalRequired: 'да' });

    expect(result.baseAmount).toBe(BONUS_SETTINGS_DEFAULTS.baseAmount);
    expect(result.approvalRequired).toBe(BONUS_SETTINGS_DEFAULTS.approvalRequired);
  });
});
