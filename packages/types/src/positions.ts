/**
 * Штатное расписание: справочник должностей.
 *
 * Перечень собран из справочника `positions` действующей (легаси) системы и
 * дополнен сведениями из Регламента о порядке присвоения классных чинов:
 * соответствие должностей и чинов, уровень в структуре, минимальная роль.
 *
 * Уровень (`level`) задаёт подчинённость внутри субъекта: чем меньше число,
 * тем выше должность. Иерархия строится по уровням, а не по полю
 * «непосредственный руководитель», — тогда структура видна сразу, без
 * ручного заполнения связей.
 */
import { type ClassRankCode } from './ranks';
import { type Role } from './roles';

/** Группа должностей внутри структуры. */
export const POSITION_GROUPS = [
  'GENERAL_OFFICE',
  'SUBJECT_MANAGEMENT',
  'SUBJECT_SECURITY',
  'SUBJECT_STAFF',
] as const;

export type PositionGroup = (typeof POSITION_GROUPS)[number];

export const POSITION_GROUP_LABEL: Record<PositionGroup, string> = {
  GENERAL_OFFICE: 'Генеральная прокуратура',
  SUBJECT_MANAGEMENT: 'Руководство субъекта',
  SUBJECT_SECURITY: 'Управление собственной безопасности',
  SUBJECT_STAFF: 'Сотрудники субъекта',
};

export const POSITION_GROUP_ORDER: Record<PositionGroup, number> = {
  GENERAL_OFFICE: 1,
  SUBJECT_MANAGEMENT: 2,
  SUBJECT_SECURITY: 3,
  SUBJECT_STAFF: 4,
};

/**
 * Где должность может существовать.
 * Должности Генеральной прокуратуры не заводятся в округах и наоборот.
 */
export const POSITION_SCOPES = ['GENERAL', 'SUBJECT'] as const;

export type PositionScope = (typeof POSITION_SCOPES)[number];

export interface PositionDefinition {
  readonly code: string;
  readonly title: string;
  readonly group: PositionGroup;
  readonly scope: PositionScope;
  /** Уровень подчинённости: 1 — высший. */
  readonly level: number;
  /** Роль в системе, которая полагается должности по умолчанию. */
  readonly role: Role;
  /** Классный чин, соответствующий должности. Регламент допускает диапазон. */
  readonly minRank: ClassRankCode | null;
  readonly maxRank: ClassRankCode | null;
  /** Идентификатор должности в действующей (легаси) системе. */
  readonly legacyId: string | null;
}

/**
 * Справочник должностей.
 *
 * Соответствие чинов взято из Регламента о порядке присвоения классных чинов.
 * Там, где регламент должность не упоминает, чин не задан (`null`) —
 * выдумывать соответствие нельзя.
 */
export const POSITION_DEFINITIONS: readonly PositionDefinition[] = [
  // --- Генеральная прокуратура -------------------------------------------
  {
    code: 'PROSECUTOR_GENERAL',
    title: 'Генеральный прокурор РФ',
    group: 'GENERAL_OFFICE',
    scope: 'GENERAL',
    level: 1,
    role: 'FEDERAL',
    minRank: 'ACTUAL_STATE_JUSTICE_ADVISER',
    maxRank: 'ACTUAL_STATE_JUSTICE_ADVISER',
    legacyId: 'f1',
  },
  {
    code: 'FIRST_DEPUTY_PROSECUTOR_GENERAL',
    title: 'Первый заместитель Генерального прокурора РФ',
    group: 'GENERAL_OFFICE',
    scope: 'GENERAL',
    level: 2,
    role: 'FEDERAL',
    minRank: 'STATE_JUSTICE_ADVISER_1',
    maxRank: 'STATE_JUSTICE_ADVISER_1',
    legacyId: 'f8',
  },
  {
    code: 'DEPUTY_PROSECUTOR_GENERAL',
    title: 'Заместитель Генерального прокурора РФ',
    group: 'GENERAL_OFFICE',
    scope: 'GENERAL',
    level: 3,
    role: 'FEDERAL',
    minRank: 'STATE_JUSTICE_ADVISER_2',
    maxRank: 'STATE_JUSTICE_ADVISER_2',
    legacyId: 'f2',
  },
  {
    code: 'HEAD_OF_DIRECTORATE',
    title: 'Начальник управления',
    group: 'GENERAL_OFFICE',
    scope: 'GENERAL',
    level: 4,
    role: 'FEDERAL',
    minRank: 'STATE_JUSTICE_ADVISER_3',
    maxRank: 'STATE_JUSTICE_ADVISER_2',
    legacyId: 'f4',
  },
  {
    code: 'ADVISER_TO_PROSECUTOR_GENERAL',
    title: 'Советник Генерального прокурора',
    group: 'GENERAL_OFFICE',
    scope: 'GENERAL',
    level: 5,
    role: 'FEDERAL',
    minRank: 'SENIOR_JUSTICE_ADVISER',
    maxRank: 'STATE_JUSTICE_ADVISER_3',
    legacyId: 'f7',
  },
  {
    code: 'SENIOR_ADVISER_GENERAL_OFFICE',
    title: 'Старший советник Генеральной прокуратуры',
    group: 'GENERAL_OFFICE',
    scope: 'GENERAL',
    level: 6,
    role: 'FEDERAL',
    minRank: 'SENIOR_JUSTICE_ADVISER',
    maxRank: 'SENIOR_JUSTICE_ADVISER',
    legacyId: 'f3',
  },
  {
    code: 'ASSISTANT_PROSECUTOR_GENERAL_SPECIAL',
    title: 'Помощник Генерального прокурора по особым поручениям',
    group: 'GENERAL_OFFICE',
    scope: 'GENERAL',
    level: 7,
    role: 'SENIOR_ASSISTANT',
    minRank: 'JUSTICE_ADVISER',
    maxRank: 'SENIOR_JUSTICE_ADVISER',
    legacyId: 'f6',
  },
  {
    code: 'ASSISTANT_DEPUTY_PROSECUTOR_GENERAL',
    title: 'Помощник заместителя Генерального прокурора РФ',
    group: 'GENERAL_OFFICE',
    scope: 'GENERAL',
    level: 8,
    role: 'SENIOR_ASSISTANT',
    minRank: 'JUNIOR_JUSTICE_ADVISER',
    maxRank: 'JUSTICE_ADVISER',
    legacyId: 'f5',
  },
  {
    code: 'STAFF_ANALYTICAL_DIRECTORATE',
    title: 'Сотрудник Главного организационно-аналитического управления',
    group: 'GENERAL_OFFICE',
    scope: 'GENERAL',
    level: 9,
    role: 'EMPLOYEE',
    minRank: null,
    maxRank: null,
    legacyId: 'pos-new-1780234983554',
  },
  {
    code: 'STAFF_INVESTIGATION_OVERSIGHT',
    title:
      'Сотрудник Главного управления по надзору за следствием, дознанием и оперативно-розыскной деятельностью',
    group: 'GENERAL_OFFICE',
    scope: 'GENERAL',
    level: 9,
    role: 'EMPLOYEE',
    minRank: null,
    maxRank: null,
    legacyId: 'pos-new-1780237791462',
  },

  // --- Руководство субъекта ----------------------------------------------
  {
    code: 'SUBJECT_PROSECUTOR',
    title: 'Прокурор субъекта',
    group: 'SUBJECT_MANAGEMENT',
    scope: 'SUBJECT',
    level: 1,
    role: 'BOSS',
    minRank: 'STATE_JUSTICE_ADVISER_3',
    maxRank: 'STATE_JUSTICE_ADVISER_2',
    legacyId: 'b1',
  },
  {
    code: 'FIRST_DEPUTY_SUBJECT_PROSECUTOR',
    title: 'Первый заместитель прокурора субъекта',
    group: 'SUBJECT_MANAGEMENT',
    scope: 'SUBJECT',
    level: 2,
    role: 'BOSS',
    minRank: 'STATE_JUSTICE_ADVISER_3',
    maxRank: 'STATE_JUSTICE_ADVISER_3',
    legacyId: 'pos-new-1780835983452',
  },
  {
    code: 'DEPUTY_SUBJECT_PROSECUTOR',
    title: 'Заместитель прокурора субъекта',
    group: 'SUBJECT_MANAGEMENT',
    scope: 'SUBJECT',
    level: 3,
    role: 'BOSS',
    minRank: 'JUSTICE_ADVISER',
    maxRank: 'STATE_JUSTICE_ADVISER_3',
    legacyId: 'pos-new-1780835985196',
  },
  {
    code: 'SENIOR_SUBJECT_PROSECUTOR',
    title: 'Старший прокурор субъекта',
    group: 'SUBJECT_MANAGEMENT',
    scope: 'SUBJECT',
    level: 4,
    role: 'BOSS',
    minRank: 'JUSTICE_ADVISER',
    maxRank: 'SENIOR_JUSTICE_ADVISER',
    legacyId: 'b3',
  },
  {
    code: 'HEAD_OF_SUBJECT_DIRECTORATE',
    title: 'Начальник УОПД',
    group: 'SUBJECT_MANAGEMENT',
    scope: 'SUBJECT',
    level: 5,
    role: 'BOSS',
    minRank: 'JUSTICE_ADVISER',
    maxRank: 'SENIOR_JUSTICE_ADVISER',
    legacyId: 'pos-new-1780808183563',
  },
  {
    code: 'HEAD_OF_DEPARTMENT',
    title: 'Начальник отдела',
    group: 'SUBJECT_MANAGEMENT',
    scope: 'SUBJECT',
    level: 6,
    role: 'BOSS',
    minRank: 'JUSTICE_ADVISER',
    maxRank: 'JUSTICE_ADVISER',
    legacyId: 'b4',
  },

  // --- Управление собственной безопасности --------------------------------
  {
    code: 'SENIOR_USB_PROSECUTOR',
    title: 'Старший прокурор УСБ',
    group: 'SUBJECT_SECURITY',
    scope: 'SUBJECT',
    level: 4,
    role: 'USP',
    minRank: 'JUSTICE_ADVISER',
    maxRank: 'SENIOR_JUSTICE_ADVISER',
    legacyId: 'usp2',
  },
  {
    code: 'USB_PROSECUTOR',
    title: 'Прокурор УСБ',
    group: 'SUBJECT_SECURITY',
    scope: 'SUBJECT',
    level: 5,
    role: 'USP',
    minRank: 'JUNIOR_JUSTICE_ADVISER',
    maxRank: 'JUSTICE_ADVISER',
    legacyId: 'usp1',
  },

  // --- Сотрудники субъекта -------------------------------------------------
  {
    code: 'DEPUTY_HEAD_OF_DEPARTMENT',
    title: 'Заместитель начальника отдела',
    group: 'SUBJECT_STAFF',
    scope: 'SUBJECT',
    level: 7,
    role: 'SENIOR_ASSISTANT',
    minRank: 'JUNIOR_JUSTICE_ADVISER',
    maxRank: 'JUSTICE_ADVISER',
    legacyId: 'ss2',
  },
  {
    code: 'SENIOR_ASSISTANT_PROSECUTOR',
    title: 'Старший помощник прокурора',
    group: 'SUBJECT_STAFF',
    scope: 'SUBJECT',
    level: 8,
    role: 'SENIOR_ASSISTANT',
    minRank: 'JUNIOR_JUSTICE_ADVISER',
    maxRank: 'JUNIOR_JUSTICE_ADVISER',
    legacyId: 'ss1',
  },
  {
    code: 'ADVISER_TO_SUBJECT_PROSECUTOR',
    title: 'Советник прокурора',
    group: 'SUBJECT_STAFF',
    scope: 'SUBJECT',
    level: 9,
    role: 'EMPLOYEE',
    minRank: 'JUSTICE_ADVISER',
    maxRank: 'JUSTICE_ADVISER',
    legacyId: 's4',
  },
  {
    code: 'ASSISTANT_PROSECUTOR',
    title: 'Помощник прокурора',
    group: 'SUBJECT_STAFF',
    scope: 'SUBJECT',
    level: 10,
    role: 'EMPLOYEE',
    minRank: 'JUNIOR_LAWYER',
    maxRank: 'LAWYER_1',
    legacyId: 's1',
  },
];

export const POSITION_CODES = POSITION_DEFINITIONS.map((position) => position.code);

export function findPositionDefinition(code: string): PositionDefinition | undefined {
  return POSITION_DEFINITIONS.find((position) => position.code === code);
}

/** Должности, допустимые в субъекте. Генеральная прокуратура — отдельный набор. */
export function positionsForSubject(subjectCode: string): readonly PositionDefinition[] {
  const scope: PositionScope = subjectCode === 'GENERAL' ? 'GENERAL' : 'SUBJECT';
  return POSITION_DEFINITIONS.filter((position) => position.scope === scope);
}

function normalizePositionTitle(title: string): string {
  return title.trim().toLowerCase().replace(/ё/gu, 'е').replace(/\s+/gu, ' ');
}

/**
 * Должность справочника по названию в пределах субъекта.
 *
 * Одно название может означать разные должности на разных уровнях
 * («Начальник управления» в Генеральной прокуратуре и в округе), поэтому
 * поиск всегда ограничен уровнем субъекта.
 */
export function findPositionByTitle(
  title: string,
  subjectCode: string,
): PositionDefinition | undefined {
  const normalized = normalizePositionTitle(title);

  return positionsForSubject(subjectCode).find(
    (position) => normalizePositionTitle(position.title) === normalized,
  );
}

/** Сортировка справочника: по группе, затем по уровню, затем по названию. */
export function comparePositions(a: PositionDefinition, b: PositionDefinition): number {
  const byGroup = POSITION_GROUP_ORDER[a.group] - POSITION_GROUP_ORDER[b.group];
  if (byGroup !== 0) {
    return byGroup;
  }

  const byLevel = a.level - b.level;
  return byLevel !== 0 ? byLevel : a.title.localeCompare(b.title, 'ru');
}

// ---------------------------------------------------------------------------
// Контракты API
// ---------------------------------------------------------------------------

export interface PositionDto {
  code: string;
  title: string;
  group: PositionGroup;
  scope: PositionScope;
  level: number;
  role: Role;
  minRank: string | null;
  maxRank: string | null;
}

/** Строка штатного расписания: должность в конкретном субъекте. */
export interface StaffLineDto {
  position: PositionDto;
  /** Предусмотрено штатным расписанием. */
  planned: number;
  /** Занято действующими сотрудниками. */
  occupied: number;
  /** Свободных единиц: не может быть отрицательным. */
  vacant: number;
  /** Занято сверх предусмотренного. */
  overstaffed: number;
  employees: {
    id: string;
    fullName: string;
    rank: string | null;
    status: string;
    /** Чин не соответствует предусмотренному для должности. */
    hasRankMismatch: boolean;
  }[];
}

export interface StaffGroupDto {
  group: PositionGroup;
  lines: StaffLineDto[];
  planned: number;
  occupied: number;
  vacant: number;
}

export interface StaffSummaryDto {
  planned: number;
  occupied: number;
  vacant: number;
  overstaffed: number;
  /** Сотрудники, чья должность отсутствует в справочнике. */
  offSchedule: number;
  /** Укомплектованность в процентах. */
  staffingRate: number;
}

export interface StaffScheduleDto {
  subject: { code: string; name: string; shortName: string };
  groups: StaffGroupDto[];
  summary: StaffSummaryDto;
  /** Сотрудники вне штатного расписания — должность не сопоставлена. */
  offSchedule: { id: string; fullName: string; position: string; status: string }[];
}
