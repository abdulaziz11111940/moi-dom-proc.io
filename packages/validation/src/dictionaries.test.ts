import { describe, expect, it } from 'vitest';

import {
  createMedalDictionarySchema,
  createPositionDictionarySchema,
  createSubjectDictionarySchema,
} from './dictionaries';

describe('createSubjectDictionarySchema', () => {
  const valid = {
    code: 'NEW_SUBJECT',
    name: 'Новый субъект',
    shortName: 'Новый',
    sortOrder: 10,
    isActive: true,
  };

  it('принимает новую запись с системным кодом', () => {
    expect(createSubjectDictionarySchema.safeParse(valid).success).toBe(true);
  });

  it('отклоняет код с пробелами и строчными буквами', () => {
    expect(createSubjectDictionarySchema.safeParse({ ...valid, code: 'new subject' }).success).toBe(
      false,
    );
  });
});

describe('createPositionDictionarySchema', () => {
  const valid = {
    code: 'SENIOR_INSPECTOR',
    title: 'Старший инспектор',
    group: 'SUBJECT_STAFF',
    scope: 'SUBJECT',
    level: 5,
    role: 'EMPLOYEE',
    minRank: '',
    maxRank: '',
    isActive: true,
  };

  it('принимает новую должность', () => {
    expect(createPositionDictionarySchema.safeParse(valid).success).toBe(true);
  });

  it('отклоняет код, начинающийся с цифры', () => {
    expect(
      createPositionDictionarySchema.safeParse({ ...valid, code: '1_INSPECTOR' }).success,
    ).toBe(false);
  });
});

describe('createMedalDictionarySchema', () => {
  const valid = {
    code: 'EXCELLENT_SERVICE',
    title: 'За отличную службу',
    isActive: true,
  };

  it('принимает новую медаль', () => {
    expect(createMedalDictionarySchema.safeParse(valid).success).toBe(true);
  });

  it('отклоняет пустое название', () => {
    expect(createMedalDictionarySchema.safeParse({ ...valid, title: '' }).success).toBe(false);
  });
});
