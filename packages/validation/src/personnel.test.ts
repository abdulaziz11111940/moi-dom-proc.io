import { describe, expect, it } from 'vitest';

import {
  changeEmployeeStatusSchema,
  changeRoleSchema,
  createPersonnelFileSchema,
  personnelNoteSchema,
  personnelQuerySchema,
  transferSubjectSchema,
} from './personnel';

describe('createPersonnelFileSchema', () => {
  const valid = {
    fullName: 'Акрапович Илья Олегович',
    subjectCode: 'KUTUZOVSKY',
    position: 'Помощник прокурора',
  };

  it('принимает минимальный набор сведений и подставляет роль по умолчанию', () => {
    const result = createPersonnelFileSchema.parse(valid);
    expect(result.role).toBe('EMPLOYEE');
  });

  it('отклоняет неизвестный субъект', () => {
    const result = createPersonnelFileSchema.safeParse({ ...valid, subjectCode: 'MOSCOW' });
    expect(result.success).toBe(false);
  });

  it('отклоняет дату приёма в произвольном формате', () => {
    const result = createPersonnelFileSchema.safeParse({ ...valid, hiredAt: '22.07.2026' });
    expect(result.success).toBe(false);
  });
});

describe('changeRoleSchema', () => {
  it('требует основание изменения роли', () => {
    const result = changeRoleSchema.safeParse({ role: 'BOSS', version: 1 });
    expect(result.success).toBe(false);
  });

  it('принимает изменение роли с основанием', () => {
    const result = changeRoleSchema.safeParse({
      role: 'BOSS',
      reason: 'Назначение исполняющим обязанности руководителя',
      version: 3,
    });
    expect(result.success).toBe(true);
  });
});

describe('transferSubjectSchema', () => {
  it('требует основание перевода', () => {
    const result = transferSubjectSchema.safeParse({ subjectCode: 'ROSTOVSKY', version: 1 });
    expect(result.success).toBe(false);
  });
});

describe('changeEmployeeStatusSchema', () => {
  it('возврат в строй не требует основания', () => {
    const result = changeEmployeeStatusSchema.safeParse({ status: 'ACTIVE', version: 1 });
    expect(result.success).toBe(true);
  });

  it.each(['SUSPENDED', 'DISMISSED', 'RESERVE', 'BLOCKED'])(
    'статус %s требует основание',
    (status) => {
      expect(changeEmployeeStatusSchema.safeParse({ status, version: 1 }).success).toBe(false);
      expect(
        changeEmployeeStatusSchema.safeParse({
          status,
          reason: 'Основание, отвечающее минимальной длине',
          version: 1,
        }).success,
      ).toBe(true);
    },
  );

  it('короткое основание не проходит проверку', () => {
    const result = changeEmployeeStatusSchema.safeParse({
      status: 'DISMISSED',
      reason: 'по факту',
      version: 1,
    });
    expect(result.success).toBe(false);
  });
});

describe('personnelNoteSchema', () => {
  it('отклоняет пустую заметку', () => {
    expect(personnelNoteSchema.safeParse({ body: '  ' }).success).toBe(false);
  });
});

describe('personnelQuerySchema', () => {
  it('подставляет значения по умолчанию', () => {
    const result = personnelQuerySchema.parse({});
    expect(result).toMatchObject({ page: 1, pageSize: 20, sortBy: 'fullName', sortOrder: 'asc' });
  });

  it('по умолчанию показывает состоящих на службе, а не архив', () => {
    expect(personnelQuerySchema.parse({}).scope).toBe('SERVICE');
    expect(personnelQuerySchema.parse({ scope: 'ARCHIVE' }).scope).toBe('ARCHIVE');
    expect(personnelQuerySchema.safeParse({ scope: 'ALL' }).success).toBe(false);
  });

  it('приводит числовые параметры из строк запроса', () => {
    const result = personnelQuerySchema.parse({ page: '2', pageSize: '50' });
    expect(result.page).toBe(2);
    expect(result.pageSize).toBe(50);
  });

  it('ограничивает размер страницы', () => {
    expect(personnelQuerySchema.safeParse({ pageSize: '500' }).success).toBe(false);
  });
});
