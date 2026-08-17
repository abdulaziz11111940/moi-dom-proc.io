import { describe, expect, it } from 'vitest';

import {
  appealsQuerySchema,
  changeAppealStatusSchema,
  createAppealSchema,
  extendAppealDeadlineSchema,
} from './appeals';

const validAppeal = {
  kind: 'APPEAL' as const,
  subjectCode: 'KUTUZOVSKY' as const,
  source: 'WRITTEN' as const,
  priority: 'NORMAL' as const,
  topic: 'Нарушение порядка рассмотрения',
  summary: 'Заявитель сообщает о нарушении установленного порядка рассмотрения обращения.',
  isAnonymous: false,
  applicantName: 'Иванов Иван Иванович',
  tags: [],
};

describe('createAppealSchema', () => {
  it('принимает корректное обращение', () => {
    expect(createAppealSchema.safeParse(validAppeal).success).toBe(true);
  });

  it('требует заявителя для неанонимного обращения', () => {
    const result = createAppealSchema.safeParse({ ...validAppeal, applicantName: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(['applicantName']);
    }
  });

  it('не требует заявителя для анонимного обращения', () => {
    const result = createAppealSchema.safeParse({
      ...validAppeal,
      isAnonymous: true,
      applicantName: '',
    });
    expect(result.success).toBe(true);
  });

  it('отклоняет слишком короткое описание', () => {
    expect(createAppealSchema.safeParse({ ...validAppeal, summary: 'коротко' }).success).toBe(false);
  });

  it('отклоняет неизвестный субъект', () => {
    expect(createAppealSchema.safeParse({ ...validAppeal, subjectCode: 'UNKNOWN' }).success).toBe(
      false,
    );
  });

  it('проверяет формат контрольного срока', () => {
    expect(createAppealSchema.safeParse({ ...validAppeal, deadlineAt: '21.08.2026' }).success).toBe(
      false,
    );
    expect(createAppealSchema.safeParse({ ...validAppeal, deadlineAt: '2026-08-21' }).success).toBe(
      true,
    );
  });
});

describe('changeAppealStatusSchema', () => {
  it('требует версию записи', () => {
    expect(changeAppealStatusSchema.safeParse({ status: 'IN_PROGRESS' }).success).toBe(false);
    expect(
      changeAppealStatusSchema.safeParse({ status: 'IN_PROGRESS', version: 1 }).success,
    ).toBe(true);
  });

  it('по умолчанию перевод выполняется в установленном порядке', () => {
    const result = changeAppealStatusSchema.parse({ status: 'IN_PROGRESS', version: 1 });
    expect(result.force).toBe(false);
  });

  // Перевод на произвольный этап должен быть обоснован: это отступление
  // от установленного порядка рассмотрения.
  it('перевод вне порядка требует основания', () => {
    const withoutReason = changeAppealStatusSchema.safeParse({
      status: 'REGISTERED',
      force: true,
      version: 3,
    });
    expect(withoutReason.success).toBe(false);
    if (!withoutReason.success) {
      expect(withoutReason.error.issues[0]?.path).toEqual(['reason']);
    }

    const shortReason = changeAppealStatusSchema.safeParse({
      status: 'REGISTERED',
      force: true,
      reason: 'вернул',
      version: 3,
    });
    expect(shortReason.success).toBe(false);

    const valid = changeAppealStatusSchema.safeParse({
      status: 'REGISTERED',
      force: true,
      reason: 'Возврат на регистрацию по указанию прокурора субъекта',
      version: 3,
    });
    expect(valid.success).toBe(true);
  });

  it('перевод вне порядка не отменяет требования указать орган', () => {
    const result = changeAppealStatusSchema.safeParse({
      status: 'TRANSFERRED_EXTERNAL',
      force: true,
      reason: 'Направлено по подведомственности по результатам проверки',
      version: 2,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path[0] === 'transferredTo')).toBe(true);
    }
  });
});

describe('extendAppealDeadlineSchema', () => {
  it('требует развёрнутого основания продления', () => {
    expect(
      extendAppealDeadlineSchema.safeParse({
        deadlineAt: '2026-09-01',
        reason: 'нужно',
        version: 1,
      }).success,
    ).toBe(false);

    expect(
      extendAppealDeadlineSchema.safeParse({
        deadlineAt: '2026-09-01',
        reason: 'Запрошены дополнительные сведения у заявителя',
        version: 1,
      }).success,
    ).toBe(true);
  });
});

describe('appealsQuerySchema', () => {
  it('подставляет значения по умолчанию', () => {
    const result = appealsQuerySchema.parse({});
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(20);
    expect(result.sortBy).toBe('registeredAt');
    expect(result.sortOrder).toBe('desc');
  });

  it('приводит одиночный статус к массиву', () => {
    const result = appealsQuerySchema.parse({ status: 'IN_PROGRESS' });
    expect(result.status).toEqual(['IN_PROGRESS']);
  });

  it('принимает несколько статусов', () => {
    const result = appealsQuerySchema.parse({ status: ['IN_PROGRESS', 'REGISTERED'] });
    expect(result.status).toHaveLength(2);
  });

  it('строка «false» не превращается в истину', () => {
    const result = appealsQuerySchema.parse({ overdueOnly: 'false', activeOnly: 'true' });
    expect(result.overdueOnly).toBe(false);
    expect(result.activeOnly).toBe(true);
  });

  it('ограничивает размер страницы', () => {
    expect(appealsQuerySchema.safeParse({ pageSize: 500 }).success).toBe(false);
  });
});
