/**
 * Классные чины.
 * Значения перенесены из справочника `classRanks` действующей (легаси) системы
 * — см. `infrastructure/legacy/legacy-reference.json`.
 */
export const CLASS_RANK_CODES = [
  'JUNIOR_LAWYER',
  'LAWYER_3',
  'LAWYER_2',
  'LAWYER_1',
  'JUNIOR_JUSTICE_ADVISER',
  'JUSTICE_ADVISER',
  'SENIOR_JUSTICE_ADVISER',
  'STATE_JUSTICE_ADVISER_3',
  'STATE_JUSTICE_ADVISER_2',
  'STATE_JUSTICE_ADVISER_1',
  'ACTUAL_STATE_JUSTICE_ADVISER',
] as const;

export type ClassRankCode = (typeof CLASS_RANK_CODES)[number];
export type ClassRankAwardedBy = 'SUBJECT_PROSECUTOR' | 'PROSECUTOR_GENERAL' | 'PRESIDENT';

export interface ClassRankDefinition {
  readonly code: ClassRankCode;
  readonly title: string;
  readonly order: number;
  /**
   * Срок пребывания в чине до присвоения следующего, в днях.
   * Задан регламентом только до старшего советника юстиции; выше —
   * присвоение решением Генерального прокурора или Президента без срока.
   */
  readonly tenureDays: number | null;
  /** Кто присваивает чин. */
  readonly awardedBy: ClassRankAwardedBy;
}

export const CLASS_RANKS: readonly ClassRankDefinition[] = [
  {
    code: 'JUNIOR_LAWYER',
    title: 'Младший юрист',
    order: 1,
    tenureDays: 7,
    awardedBy: 'SUBJECT_PROSECUTOR',
  },
  {
    code: 'LAWYER_3',
    title: 'Юрист 3 класса',
    order: 2,
    tenureDays: 14,
    awardedBy: 'SUBJECT_PROSECUTOR',
  },
  {
    code: 'LAWYER_2',
    title: 'Юрист 2 класса',
    order: 3,
    tenureDays: 21,
    awardedBy: 'SUBJECT_PROSECUTOR',
  },
  {
    code: 'LAWYER_1',
    title: 'Юрист 1 класса',
    order: 4,
    tenureDays: 28,
    awardedBy: 'SUBJECT_PROSECUTOR',
  },
  {
    code: 'JUNIOR_JUSTICE_ADVISER',
    title: 'Младший советник юстиции',
    order: 5,
    tenureDays: 28,
    awardedBy: 'SUBJECT_PROSECUTOR',
  },
  {
    code: 'JUSTICE_ADVISER',
    title: 'Советник юстиции',
    order: 6,
    tenureDays: 35,
    awardedBy: 'SUBJECT_PROSECUTOR',
  },
  {
    code: 'SENIOR_JUSTICE_ADVISER',
    title: 'Старший советник юстиции',
    order: 7,
    tenureDays: null,
    awardedBy: 'PROSECUTOR_GENERAL',
  },
  {
    code: 'STATE_JUSTICE_ADVISER_3',
    title: 'Государственный советник юстиции 3 класса',
    order: 8,
    tenureDays: null,
    awardedBy: 'PROSECUTOR_GENERAL',
  },
  {
    code: 'STATE_JUSTICE_ADVISER_2',
    title: 'Государственный советник юстиции 2 класса',
    order: 9,
    tenureDays: null,
    awardedBy: 'PROSECUTOR_GENERAL',
  },
  {
    code: 'STATE_JUSTICE_ADVISER_1',
    title: 'Государственный советник юстиции 1 класса',
    order: 10,
    tenureDays: null,
    awardedBy: 'PROSECUTOR_GENERAL',
  },
  {
    code: 'ACTUAL_STATE_JUSTICE_ADVISER',
    title: 'Действительный государственный советник юстиции',
    order: 11,
    tenureDays: null,
    awardedBy: 'PRESIDENT',
  },
];

export function findClassRank(code: string): ClassRankDefinition | undefined {
  return CLASS_RANKS.find((rank) => rank.code === code);
}

/**
 * Классный чин по названию.
 * В личных делах чин хранится текстом, в том числе перенесённым из легаси,
 * поэтому сопоставление ведётся по нормализованному названию.
 */
export function classRankByTitle(title: string): ClassRankDefinition | undefined {
  const normalized = normalizeRankTitle(title);
  return CLASS_RANKS.find((rank) => normalizeRankTitle(rank.title) === normalized);
}

function normalizeRankTitle(title: string): string {
  return title.trim().toLowerCase().replace(/ё/gu, 'е').replace(/\s+/gu, ' ');
}

/** Порядковый номер чина: чем больше, тем выше. `null` — чин не распознан. */
export function classRankOrder(title: string | null): number | null {
  if (!title) {
    return null;
  }

  return classRankByTitle(title)?.order ?? null;
}

/**
 * Досрочное присвоение допускается по истечении не менее половины срока.
 * Регламент о порядке присвоения классных чинов.
 */
export const EARLY_PROMOTION_TENURE_SHARE = 0.5;

/**
 * Обстоятельства, при которых присвоение чина не допускается.
 * Перечень регламента; проверка выполняется при кадровом действии.
 */
export const RANK_PROMOTION_BLOCKERS = [
  'DISCIPLINARY_SANCTION',
  'INTERNAL_REVIEW',
  'CRIMINAL_CASE',
] as const;

export type RankPromotionBlocker = (typeof RANK_PROMOTION_BLOCKERS)[number];

export const RANK_PROMOTION_BLOCKER_LABEL: Record<RankPromotionBlocker, string> = {
  DISCIPLINARY_SANCTION: 'Действующее дисциплинарное взыскание',
  INTERNAL_REVIEW: 'Проводится служебная проверка',
  CRIMINAL_CASE: 'Возбуждено уголовное дело',
};

/**
 * Медали.
 * Значения перенесены из справочника `medals` действующей (легаси) системы.
 */
export interface MedalDefinition {
  readonly code: string;
  readonly title: string;
}

export const MEDALS: readonly MedalDefinition[] = [
  { code: 'IMPECCABLE_SERVICE', title: 'За безупречную службу' },
  { code: 'RULE_OF_LAW', title: 'За укрепление законности' },
  { code: 'HONORED_WORKER', title: 'Почётный работник прокуратуры' },
  { code: 'COOPERATION_AND_DISCIPLINE', title: 'За взаимодействие и служебную дисциплину' },
];
