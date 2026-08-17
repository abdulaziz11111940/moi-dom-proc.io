/**
 * Журнал деятельности.
 *
 * Воспроизводит пилотную версию журнала действующей системы: запись
 * полиморфна по типу события (`kind` — производное свойство типа, а не
 * отдельное поле записи), привязана к организации («фракции») и требует
 * хотя бы одного подтверждающего доказательства. У записи нет статуса
 * «в работе / завершено» — это журнал фактов, а не список задач.
 *
 * Расчёт коэффициента премии по статистике журнала (как в действующей
 * системе) в этой версии не подключён — только сам журнал и блок метрик.
 */
import { type Role } from './roles';

export const ACTIVITY_EVENT_TYPES = [
  'DETENTION',
  'DECISION',
  'FINE',
  'WARNING',
  'DISCIPLINARY',
  'OFFICIAL_VISIT',
  'NEWS',
  'DUTY',
] as const;

export type ActivityEventType = (typeof ACTIVITY_EVENT_TYPES)[number];

export const ACTIVITY_EVENT_KINDS = ['PERSON', 'VISIT', 'NEWS', 'DUTY'] as const;
export type ActivityEventKind = (typeof ACTIVITY_EVENT_KINDS)[number];

export interface ActivityEventTypeMeta {
  readonly label: string;
  readonly kind: ActivityEventKind;
  /** Новости пресс-службы не входят в статистику по типам/лицам/фракциям. */
  readonly excludeFromMetrics?: boolean;
}

export const ACTIVITY_EVENT_TYPE_META: Record<ActivityEventType, ActivityEventTypeMeta> = {
  DETENTION: { label: 'Задержание госслужащего', kind: 'PERSON' },
  DECISION: { label: 'Вынесение решения в отношении госслужащего', kind: 'PERSON' },
  FINE: { label: 'Назначение штрафа госслужащему', kind: 'PERSON' },
  WARNING: { label: 'Назначение предупреждения госслужащему', kind: 'PERSON' },
  DISCIPLINARY: { label: 'Дисциплинарное взыскание', kind: 'PERSON' },
  OFFICIAL_VISIT: { label: 'Официальный визит / лекция / мероприятие', kind: 'VISIT' },
  NEWS: { label: 'Новость (пресс-служба)', kind: 'NEWS', excludeFromMetrics: true },
  DUTY: { label: 'Дежурство', kind: 'DUTY' },
};

export function getActivityEventKind(type: ActivityEventType): ActivityEventKind {
  return ACTIVITY_EVENT_TYPE_META[type].kind;
}

export const DECISION_OUTCOMES = ['PUNISHMENT', 'RELEASED'] as const;
export type DecisionOutcome = (typeof DECISION_OUTCOMES)[number];

export const DECISION_OUTCOME_LABEL: Record<DecisionOutcome, string> = {
  PUNISHMENT: 'Наказание',
  RELEASED: 'Освобождение',
};

/** Роль, начиная с которой запись видна во всём субъекте (не только своя). */
export const ACTIVITY_SUBJECT_SCOPE_MIN_ROLE: Role = 'SENIOR_ASSISTANT';

// ---------------------------------------------------------------------------
// Полиморфные блоки записи
// ---------------------------------------------------------------------------

/** Персональный блок: задержание, решение, штраф, предупреждение, взыскание. */
export interface ActivityPersonRecord {
  targetFullName: string;
  targetId: string;
  targetPosition: string;
  reason: string;
  decisionOutcome: DecisionOutcome | null;
  measureLabel: string;
  includeInDossier: boolean;
}

export interface ActivityVisitRecord {
  topic: string;
  description: string;
}

export interface ActivityNewsRecord {
  headline: string;
  body: string;
}

export interface ActivityDutyRecord {
  dutyTimeFrom: string;
  dutyTimeTo: string;
  description: string;
}

// ---------------------------------------------------------------------------
// Контракты API
// ---------------------------------------------------------------------------

export interface ActivityPersonRef {
  id: string;
  fullName: string;
  position: string;
}

export interface ActivityFactionRef {
  id: string;
  name: string;
}

/** Краткое представление события, вычисленное на сервере по правилам типа. */
export interface ActivityEventSummary {
  primary: string;
  secondary: string;
  reason: string;
}

export interface ActivityEvidenceFileDto {
  ref: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
}

const ACTIVITY_EVIDENCE_PREFIX = 'femida-activity-file:v1|';

export function createActivityEvidenceRef(input: {
  uploaderId: string;
  objectKey: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
}): string {
  return `${ACTIVITY_EVIDENCE_PREFIX}${[
    input.uploaderId,
    input.objectKey,
    input.fileName,
    input.mimeType,
    String(input.sizeBytes),
  ]
    .map((value) => encodeURIComponent(value))
    .join('|')}`;
}

export function parseActivityEvidenceRef(ref: string):
  | (ActivityEvidenceFileDto & {
      uploaderId: string;
      objectKey: string;
    })
  | null {
  if (!ref.startsWith(ACTIVITY_EVIDENCE_PREFIX)) return null;
  let parts: string[];
  try {
    parts = ref.slice(ACTIVITY_EVIDENCE_PREFIX.length).split('|').map(decodeURIComponent);
  } catch {
    return null;
  }
  if (parts.length !== 5) return null;
  const [uploaderId, objectKey, fileName, mimeType, sizeText] = parts;
  const sizeBytes = Number(sizeText);
  if (!uploaderId || !objectKey || !fileName || !mimeType || !Number.isSafeInteger(sizeBytes)) {
    return null;
  }
  return { ref, uploaderId, objectKey, fileName, mimeType, sizeBytes };
}

export interface ActivityRecordDto {
  id: string;
  type: ActivityEventType;
  eventDate: string;
  subject: { code: string; name: string; shortName: string };
  faction: ActivityFactionRef | null;
  author: ActivityPersonRef;
  updatedBy: ActivityPersonRef | null;
  links: string[];
  evidenceFiles: ActivityEvidenceFileDto[];
  title: string;
  summary: ActivityEventSummary;
  personRecord: ActivityPersonRecord | null;
  visitRecord: (ActivityVisitRecord & { participants: ActivityPersonRef[] }) | null;
  newsRecord: ActivityNewsRecord | null;
  dutyRecord: ActivityDutyRecord | null;
  createdAt: string;
  updatedAt: string;
  permissions: { canEdit: boolean; canDelete: boolean };
}

export interface ActivityRecordSaveResult {
  record: ActivityRecordDto;
  /** Непреграждающие предупреждения — например, о возможном дубликате лица. */
  warnings: string[];
}

export interface ActivitySummaryDto {
  totalEvents: number;
  /** Записи типа DECISION за период. */
  closedCases: number;
  evidenceCoveragePercent: number;
  uniqueFactions: number;
}

export interface ActivityListResponse {
  items: ActivityRecordDto[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  period: string;
  summary: ActivitySummaryDto;
  canCreate: boolean;
}
