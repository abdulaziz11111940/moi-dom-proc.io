/**
 * Справочник субъектов ЕИАС «Фемида».
 * Список является базовым: новые субъекты добавляются через административный
 * справочник и хранятся в таблице `Subject`.
 *
 * Поле `legacyName` содержит название субъекта в действующей (легаси) системе
 * и используется слоем миграции данных.
 */
export const SUBJECT_CODES = [
  'GENERAL',
  'RUBLEVSKY',
  'ARBATSKY',
  'PATRIARSHY',
  'TVERSKOY',
  'KUTUZOVSKY',
] as const;

export type SubjectCode = (typeof SUBJECT_CODES)[number];

export interface SubjectDefinition {
  readonly code: SubjectCode;
  readonly name: string;
  readonly shortName: string;
  /**
   * Компактное название для узких элементов интерфейса — например,
   * подписи в боковой навигации, где полное название не умещается.
   */
  readonly compactName: string;
  readonly order: number;
  readonly legacyName: string;
}

export const SUBJECT_DEFINITIONS: readonly SubjectDefinition[] = [
  {
    code: 'GENERAL',
    name: 'Генеральная прокуратура',
    shortName: 'ГП',
    compactName: 'Генеральная прокуратура',
    order: 1,
    legacyName: 'Генеральная прокуратура',
  },
  {
    code: 'RUBLEVSKY',
    name: 'Рублёвский федеральный округ',
    shortName: 'РФО',
    compactName: 'Рублёвский ФО',
    order: 2,
    legacyName: 'Рублевский Федеральный Округ (РФО)',
  },
  {
    code: 'ARBATSKY',
    name: 'Арбатский федеральный округ',
    shortName: 'АФО',
    compactName: 'Арбатский ФО',
    order: 3,
    legacyName: 'Арбатский Федеральный Округ (АФО)',
  },
  {
    code: 'PATRIARSHY',
    name: 'Патриарший федеральный округ',
    shortName: 'ПФО',
    compactName: 'Патриарший ФО',
    order: 4,
    legacyName: 'Патриарший Федеральный Округ (ПФО)',
  },
  {
    code: 'TVERSKOY',
    name: 'Тверской федеральный округ',
    shortName: 'ТФО',
    compactName: 'Тверской ФО',
    order: 5,
    legacyName: 'Тверской Федеральный Округ (ТФО)',
  },
  {
    code: 'KUTUZOVSKY',
    name: 'Кутузовский федеральный округ',
    shortName: 'КФО',
    compactName: 'Кутузовский ФО',
    order: 6,
    legacyName: 'Кутузовский Федеральный Округ (КФО)',
  },
];

export function isSubjectCode(value: string): value is SubjectCode {
  return (SUBJECT_CODES as readonly string[]).includes(value);
}

export function findSubjectDefinition(code: string): SubjectDefinition | undefined {
  return SUBJECT_DEFINITIONS.find((subject) => subject.code === code);
}

/** Представление субъекта, возвращаемое API. */
export interface SubjectDto {
  id: string;
  code: string;
  name: string;
  shortName: string;
  order: number;
  isActive: boolean;
}
