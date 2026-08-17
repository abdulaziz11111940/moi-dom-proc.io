import { describe, expect, it } from 'vitest';

import {
  createInspectionSchema,
  inspectionActionSchema,
  inspectionQuerySchema,
  updateInspectionSchema,
} from './inspections';

describe('createInspectionSchema', () => {
  it('принимает минимальный набор со значением типа по умолчанию', () => {
    const result = createInspectionSchema.parse({ subjectCode: 'KUTUZOVSKY' });
    expect(result.typeLabel).toBe('Плановая проверка');
  });

  it('отклоняет неизвестный субъект', () => {
    expect(createInspectionSchema.safeParse({ subjectCode: 'MOSCOW' }).success).toBe(false);
  });

  it('ссылка должна начинаться с http', () => {
    expect(
      createInspectionSchema.safeParse({ subjectCode: 'KUTUZOVSKY', basisLink: 'javascript:alert(1)' })
        .success,
    ).toBe(false);
    expect(
      createInspectionSchema.safeParse({ subjectCode: 'KUTUZOVSKY', basisLink: 'https://discord.com/x' })
        .success,
    ).toBe(true);
  });

  it('дата в неверном формате отклоняется', () => {
    expect(
      createInspectionSchema.safeParse({ subjectCode: 'KUTUZOVSKY', periodFrom: '01.07.2026' }).success,
    ).toBe(false);
  });
});

describe('updateInspectionSchema', () => {
  it('требует версию', () => {
    expect(updateInspectionSchema.safeParse({ typeLabel: 'Внеплановая проверка' }).success).toBe(
      false,
    );
    expect(
      updateInspectionSchema.safeParse({ typeLabel: 'Внеплановая проверка', version: 2 }).success,
    ).toBe(true);
  });
});

describe('inspectionActionSchema', () => {
  it('принимает действие с версией', () => {
    expect(inspectionActionSchema.safeParse({ action: 'activate', version: 1 }).success).toBe(true);
  });

  it('отклоняет неизвестное действие', () => {
    expect(inspectionActionSchema.safeParse({ action: 'archive', version: 1 }).success).toBe(false);
  });

  it('принимает утверждение с оценкой', () => {
    const result = inspectionActionSchema.safeParse({
      action: 'approve',
      finalRating: 'GOOD',
      finalConclusion: 'Нарушений не выявлено',
      version: 3,
    });
    expect(result.success).toBe(true);
  });

  it('неизвестная оценка отклоняется', () => {
    expect(
      inspectionActionSchema.safeParse({ action: 'approve', finalRating: 'PERFECT', version: 3 })
        .success,
    ).toBe(false);
  });
});

describe('inspectionQuerySchema', () => {
  it('подставляет значения по умолчанию', () => {
    const result = inspectionQuerySchema.parse({});
    expect(result).toMatchObject({ page: 1, pageSize: 20, sortBy: 'createdAt', sortOrder: 'desc' });
  });

  it('ограничивает размер страницы', () => {
    expect(inspectionQuerySchema.safeParse({ pageSize: '500' }).success).toBe(false);
  });
});
