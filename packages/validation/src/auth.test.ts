import { describe, expect, it } from 'vitest';

import { loginSchema, registrationSchema } from './auth';
import { fullNameLookupKey, normalizeFullName } from './common';

describe('normalizeFullName', () => {
  it('убирает лишние пробелы и приводит регистр', () => {
    expect(normalizeFullName('  Челищев   Григорий Станиславович ')).toBe(
      'челищев григорий станиславович',
    );
  });

  it('приводит «ё» к «е», чтобы поиск учётной записи был устойчивым', () => {
    expect(normalizeFullName('Королёв Пётр Ильич')).toBe('королев петр ильич');
  });

  it('формирует детерминированный ключ поиска', () => {
    expect(fullNameLookupKey('Королёв Пётр Ильич')).toBe('королев_петр_ильич');
  });
});

describe('loginSchema', () => {
  it('принимает корректные данные', () => {
    const result = loginSchema.safeParse({ fullName: 'Иванов Иван', password: 'secret' });
    expect(result.success).toBe(true);
  });

  it('требует минимум фамилию и имя', () => {
    const result = loginSchema.safeParse({ fullName: 'Иванов', password: 'secret' });
    expect(result.success).toBe(false);
  });

  it('не принимает пустой пароль', () => {
    const result = loginSchema.safeParse({ fullName: 'Иванов Иван', password: '' });
    expect(result.success).toBe(false);
  });
});

describe('registrationSchema', () => {
  const valid = {
    fullName: 'Челищев Григорий Станиславович',
    discordId: '123456789012345678',
    subjectCode: 'KUTUZOVSKY',
    desiredPosition: 'Помощник прокурора',
    password: 'StrongPass123',
    passwordConfirmation: 'StrongPass123',
    comment: '',
    acceptDisclaimer: true as const,
  };

  it('принимает корректную заявку', () => {
    expect(registrationSchema.safeParse(valid).success).toBe(true);
  });

  it('отклоняет несуществующий субъект', () => {
    const result = registrationSchema.safeParse({ ...valid, subjectCode: 'UNKNOWN' });
    expect(result.success).toBe(false);
  });

  it('отклоняет слабый пароль', () => {
    const result = registrationSchema.safeParse({
      ...valid,
      password: 'password',
      passwordConfirmation: 'password',
    });
    expect(result.success).toBe(false);
  });

  it('отклоняет несовпадающие пароли', () => {
    const result = registrationSchema.safeParse({
      ...valid,
      passwordConfirmation: 'AnotherPass123',
    });
    expect(result.success).toBe(false);
  });

  it('отклоняет некорректный Discord ID', () => {
    const result = registrationSchema.safeParse({ ...valid, discordId: 'not-a-discord-id' });
    expect(result.success).toBe(false);
  });
});
