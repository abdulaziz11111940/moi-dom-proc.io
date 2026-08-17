import { describe, expect, it } from 'vitest';

import {
  staffScheduleQuerySchema,
  updateStaffAllocationSchema,
  updateStaffScheduleSchema,
} from './staff';

describe('staffScheduleQuerySchema', () => {
  it('по умолчанию скрывает незанятые должности', () => {
    expect(staffScheduleQuerySchema.parse({}).includeEmpty).toBe(false);
  });

  it('строка «false» из запроса не считается истиной', () => {
    // z.coerce.boolean() превратил бы «false» в true.
    expect(staffScheduleQuerySchema.parse({ includeEmpty: 'false' }).includeEmpty).toBe(false);
    expect(staffScheduleQuerySchema.parse({ includeEmpty: 'true' }).includeEmpty).toBe(true);
  });

  it('отклоняет неизвестный субъект', () => {
    expect(staffScheduleQuerySchema.safeParse({ subjectCode: 'MOSCOW' }).success).toBe(false);
  });
});

describe('updateStaffAllocationSchema', () => {
  const valid = {
    subjectCode: 'KUTUZOVSKY',
    positionCode: 'ASSISTANT_PROSECUTOR',
    plannedUnits: 12,
  };

  it('принимает корректное изменение', () => {
    expect(updateStaffAllocationSchema.safeParse(valid).success).toBe(true);
  });

  it('ноль допустим: должность не предусмотрена', () => {
    expect(updateStaffAllocationSchema.safeParse({ ...valid, plannedUnits: 0 }).success).toBe(true);
  });

  it('отрицательное количество отклоняется', () => {
    expect(updateStaffAllocationSchema.safeParse({ ...valid, plannedUnits: -1 }).success).toBe(
      false,
    );
  });

  it('дробное количество отклоняется', () => {
    expect(updateStaffAllocationSchema.safeParse({ ...valid, plannedUnits: 1.5 }).success).toBe(
      false,
    );
  });

  it('защищает от опечатки в порядке величины', () => {
    expect(updateStaffAllocationSchema.safeParse({ ...valid, plannedUnits: 1000 }).success).toBe(
      false,
    );
  });

  it('отклоняет должность вне справочника', () => {
    expect(
      updateStaffAllocationSchema.safeParse({ ...valid, positionCode: 'НЕТ_ТАКОЙ' }).success,
    ).toBe(false);
  });

  it('версия необязательна при первом задании норматива', () => {
    const result = updateStaffAllocationSchema.parse(valid);
    expect(result.version).toBeUndefined();
  });
});

describe('updateStaffScheduleSchema', () => {
  const line = { positionCode: 'ASSISTANT_PROSECUTOR', plannedUnits: 5 };

  it('принимает перечень строк', () => {
    expect(
      updateStaffScheduleSchema.safeParse({ subjectCode: 'KUTUZOVSKY', lines: [line] }).success,
    ).toBe(true);
  });

  it('отклоняет пустой перечень', () => {
    expect(
      updateStaffScheduleSchema.safeParse({ subjectCode: 'KUTUZOVSKY', lines: [] }).success,
    ).toBe(false);
  });

  it('отклоняет повторяющуюся должность', () => {
    // Иначе последняя строка молча перезаписала бы предыдущую.
    const result = updateStaffScheduleSchema.safeParse({
      subjectCode: 'KUTUZOVSKY',
      lines: [line, { ...line, plannedUnits: 9 }],
    });

    expect(result.success).toBe(false);
  });
});
