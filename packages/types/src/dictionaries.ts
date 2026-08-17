/** Справочники (администрирование). */
import { type PositionGroup, type PositionScope } from './positions';
import { type ClassRankAwardedBy } from './ranks';
import { type Role } from './roles';

export const DICTIONARY_MANAGE_MIN_ROLE: Role = 'FEDERAL';

/** Субъект в редакторе справочника (полная запись, с идентификатором). */
export interface SubjectDictionaryDto {
  id: string;
  code: string;
  name: string;
  shortName: string;
  sortOrder: number;
  isActive: boolean;
  /** Число закреплённых сотрудников: запись со связями нельзя деактивировать бездумно. */
  employeeCount: number;
}

/** Должность в редакторе справочника. */
export interface PositionDictionaryDto {
  id: string;
  code: string;
  title: string;
  group: PositionGroup;
  scope: PositionScope;
  level: number;
  role: Role;
  minRank: string | null;
  maxRank: string | null;
  isActive: boolean;
  employeeCount: number;
}

/** Медаль в редакторе справочника. */
export interface MedalDictionaryDto {
  id: string;
  code: string;
  title: string;
  iconUrl: string | null;
  isActive: boolean;
}

export interface ClassRankDictionaryDto {
  code: string;
  title: string;
  iconUrl: string | null;
  order: number;
  tenureDays: number | null;
  awardedBy: ClassRankAwardedBy;
  isActive: boolean;
}

export interface DictionaryIconUploadDto {
  iconUrl: string;
}
