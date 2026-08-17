import { describe, expect, it } from 'vitest';

import { CLASS_RANKS, findClassRank } from './ranks';
import {
  comparePositions,
  findPositionByTitle,
  findPositionDefinition,
  POSITION_DEFINITIONS,
  positionsForSubject,
} from './positions';

describe('справочник должностей', () => {
  it('коды уникальны', () => {
    const codes = POSITION_DEFINITIONS.map((position) => position.code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it('идентификаторы легаси уникальны', () => {
    const ids = POSITION_DEFINITIONS.map((position) => position.legacyId).filter(Boolean);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('соответствие чинов ссылается на существующие чины', () => {
    for (const position of POSITION_DEFINITIONS) {
      if (position.minRank) {
        expect(findClassRank(position.minRank), position.code).toBeDefined();
      }
      if (position.maxRank) {
        expect(findClassRank(position.maxRank), position.code).toBeDefined();
      }
    }
  });

  it('нижняя граница чина не выше верхней', () => {
    for (const position of POSITION_DEFINITIONS) {
      if (!position.minRank || !position.maxRank) {
        continue;
      }

      const min = findClassRank(position.minRank)?.order ?? 0;
      const max = findClassRank(position.maxRank)?.order ?? 0;
      expect(min, position.code).toBeLessThanOrEqual(max);
    }
  });
});

describe('positionsForSubject', () => {
  it('в Генеральную прокуратуру попадают только её должности', () => {
    const positions = positionsForSubject('GENERAL');
    expect(positions.every((position) => position.scope === 'GENERAL')).toBe(true);
    expect(positions.some((position) => position.code === 'PROSECUTOR_GENERAL')).toBe(true);
  });

  it('в округ не попадают должности Генеральной прокуратуры', () => {
    const positions = positionsForSubject('KUTUZOVSKY');
    expect(positions.every((position) => position.scope === 'SUBJECT')).toBe(true);
    expect(positions.some((position) => position.code === 'PROSECUTOR_GENERAL')).toBe(false);
  });
});

describe('findPositionByTitle', () => {
  it('находит должность по точному названию', () => {
    expect(findPositionByTitle('Помощник прокурора', 'KUTUZOVSKY')?.code).toBe(
      'ASSISTANT_PROSECUTOR',
    );
  });

  it('не различает регистр, «ё» и лишние пробелы', () => {
    expect(findPositionByTitle('  помощник   прокурора ', 'KUTUZOVSKY')?.code).toBe(
      'ASSISTANT_PROSECUTOR',
    );
  });

  it('одно название означает разные должности на разных уровнях', () => {
    // «Начальник управления» есть только в Генеральной прокуратуре.
    expect(findPositionByTitle('Начальник управления', 'GENERAL')?.code).toBe(
      'HEAD_OF_DIRECTORATE',
    );
    expect(findPositionByTitle('Начальник управления', 'KUTUZOVSKY')).toBeUndefined();
  });

  it('не подбирает похожую должность вместо отсутствующей', () => {
    expect(findPositionByTitle('Джамал', 'KUTUZOVSKY')).toBeUndefined();
    expect(findPositionByTitle('Помощик прокурора', 'KUTUZOVSKY')).toBeUndefined();
  });
});

describe('comparePositions', () => {
  it('сортирует по группе, затем по уровню', () => {
    const sorted = [...POSITION_DEFINITIONS].sort(comparePositions);

    expect(sorted[0]?.code).toBe('PROSECUTOR_GENERAL');
    expect(sorted.at(-1)?.code).toBe('ASSISTANT_PROSECUTOR');
  });
});

describe('классные чины', () => {
  it('порядок чинов последователен и без пропусков', () => {
    const orders = CLASS_RANKS.map((rank) => rank.order);
    expect(orders).toEqual(orders.map((_, index) => index + 1));
  });

  it('срок выслуги задан только до советника юстиции включительно', () => {
    for (const rank of CLASS_RANKS) {
      if (rank.order <= 6) {
        expect(rank.tenureDays, rank.code).toBeGreaterThan(0);
      } else {
        expect(rank.tenureDays, rank.code).toBeNull();
      }
    }
  });

  it('высший чин присваивается Президентом', () => {
    expect(findPositionDefinition('PROSECUTOR_GENERAL')?.minRank).toBe(
      'ACTUAL_STATE_JUSTICE_ADVISER',
    );
    expect(findClassRank('ACTUAL_STATE_JUSTICE_ADVISER')?.awardedBy).toBe('PRESIDENT');
  });
});
