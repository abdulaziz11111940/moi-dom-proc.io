import { describe, expect, it } from 'vitest';

import { cn } from './cn';
import { femidaPalette, femidaThemeColors } from './tokens';
import { roleBadgeClasses } from './variants';

describe('cn', () => {
  it('объединяет классы', () => {
    expect(cn('px-2', 'py-1')).toBe('px-2 py-1');
  });

  it('разрешает конфликт в пользу последнего класса', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });

  it('игнорирует ложные значения', () => {
    const isCompact = false;
    expect(cn('px-2', isCompact && 'py-1', undefined, null)).toBe('px-2');
  });
});

describe('палитра', () => {
  it('соответствует утверждённым значениям', () => {
    expect(femidaPalette.background).toBe('#07162f');
    expect(femidaPalette.gold).toBe('#d5b060');
    expect(femidaPalette.sidebar).toBe('#091834');
  });

  it('пробрасывается в тему Tailwind', () => {
    expect(femidaThemeColors.femida.bg).toBe(femidaPalette.background);
    expect(femidaThemeColors.femida['gold-light']).toBe(femidaPalette.goldLight);
  });
});

describe('roleBadgeClasses', () => {
  it('покрывает все роли', () => {
    expect(Object.keys(roleBadgeClasses)).toHaveLength(6);
  });
});
