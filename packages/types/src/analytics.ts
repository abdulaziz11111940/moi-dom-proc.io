/** Аналитика: сводные показатели по обращениям, проверкам и журналу деятельности. */
import { type Role } from './roles';

/** Роль, начиная с которой доступна аналитика. */
export const ANALYTICS_READ_MIN_ROLE: Role = 'SENIOR_ASSISTANT';

export interface AnalyticsKpiDto {
  appealsOpen: number;
  appealsOverdue: number;
  appealsRegisteredInPeriod: number;
  appealsCompletedInPeriod: number;
  inspectionsActive: number;
  inspectionsCompletedInPeriod: number;
  activityRecordsInPeriod: number;
  decisionsClosedInPeriod: number;
}

export interface AnalyticsTrendPointDto {
  period: string;
  appealsRegistered: number;
  appealsCompleted: number;
  activityRecords: number;
}

export interface AnalyticsSubjectRowDto {
  subject: { code: string; name: string; shortName: string };
  appealsOpen: number;
  appealsOverdue: number;
  inspectionsActive: number;
  activityRecordsInPeriod: number;
}

export interface AnalyticsEmployeeRowDto {
  id: string;
  fullName: string;
  position: string;
  appealsOpen: number;
  appealsOverdue: number;
  activityRecordsInPeriod: number;
  decisionsClosedInPeriod: number;
}

export interface AnalyticsResponse {
  period: string;
  kpi: AnalyticsKpiDto;
  trend: AnalyticsTrendPointDto[];
  /** Сравнение по субъектам — только для федерального уровня и администратора. */
  subjects: AnalyticsSubjectRowDto[] | null;
  /** Разбивка по сотрудникам выбранного субъекта — от старшего помощника; пусто для сводки по всем субъектам. */
  employees: AnalyticsEmployeeRowDto[] | null;
}
