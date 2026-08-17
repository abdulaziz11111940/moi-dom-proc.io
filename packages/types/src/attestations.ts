/** Аттестации сотрудников. */
import { type Role } from './roles';

/** Роль, начиная с которой доступно управление аттестациями. */
export const ATTESTATION_MANAGE_MIN_ROLE: Role = 'USP';
/** Роль, начиная с которой можно выносить итоговое решение. */
export const ATTESTATION_DECISION_MIN_ROLE: Role = 'BOSS';

/** Критерии оценки. Перечень фиксирован регламентом. */
export const ATTESTATION_CRITERIA = [
  { code: 'KNOWLEDGE', label: 'Профессиональные знания' },
  { code: 'QUALITY', label: 'Качество и результативность работы' },
  { code: 'DISCIPLINE', label: 'Исполнительская дисциплина' },
  { code: 'INITIATIVE', label: 'Инициативность и самостоятельность' },
  { code: 'TEAMWORK', label: 'Взаимодействие в коллективе' },
] as const;

export type AttestationCriterionCode = (typeof ATTESTATION_CRITERIA)[number]['code'];

export const ATTESTATION_SCORE_MIN = 1;
export const ATTESTATION_SCORE_MAX = 5;

export type AttestationScores = Partial<Record<AttestationCriterionCode, number>>;

export const ATTESTATION_STATUSES = [
  'KNOWLEDGE_TEST',
  'SELF_ASSESSMENT',
  'SUPERVISOR_REVIEW',
  'DECISION',
  'COMPLETED',
  'CANCELLED',
] as const;

export type AttestationStatus = (typeof ATTESTATION_STATUSES)[number];

export const ATTESTATION_STATUS_LABEL: Record<AttestationStatus, string> = {
  KNOWLEDGE_TEST: 'Проверка знаний',
  SELF_ASSESSMENT: 'Самооценка',
  SUPERVISOR_REVIEW: 'Оценка руководителя',
  DECISION: 'Решение',
  COMPLETED: 'Завершена',
  CANCELLED: 'Отменена',
};

export const ATTESTATION_EXAM_QUESTION_COUNT = 10;
export const ATTESTATION_EXAM_MIN_BANK_SIZE = 5;
export const ATTESTATION_EXAM_DURATION_MINUTES = 25;
export const ATTESTATION_EXAM_PASS_PERCENT = 80;

export const ATTESTATION_QUESTION_DIFFICULTIES = ['BASIC', 'INTERMEDIATE', 'ADVANCED'] as const;
export type AttestationQuestionDifficulty = (typeof ATTESTATION_QUESTION_DIFFICULTIES)[number];

export const ATTESTATION_QUESTION_DIFFICULTY_LABEL: Record<AttestationQuestionDifficulty, string> =
  {
    BASIC: 'Базовый',
    INTERMEDIATE: 'Средний',
    ADVANCED: 'Повышенный',
  };

export interface AttestationQuestionOption {
  id: string;
  text: string;
}

/** Полная запись банка. Правильный ответ доступен только пользователю, управляющему банком. */
export interface AttestationQuestionDto {
  id: string;
  actTitle: string;
  articleRef: string | null;
  sourceUrl: string;
  prompt: string;
  options: AttestationQuestionOption[];
  correctOptionId: string;
  explanation: string | null;
  difficulty: AttestationQuestionDifficulty;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Вопрос экзамена без правильного ответа. Порядок вариантов зафиксирован для конкретной попытки. */
export interface AttestationExamQuestionDto {
  id: string;
  actTitle: string;
  articleRef: string | null;
  sourceUrl: string;
  prompt: string;
  options: AttestationQuestionOption[];
}

export interface AttestationExamAttemptDto {
  id: string;
  attemptNumber: number;
  status: 'ACTIVE' | 'SUBMITTED' | 'EXPIRED';
  questions: AttestationExamQuestionDto[];
  startedAt: string;
  expiresAt: string;
  submittedAt: string | null;
  scorePercent: number | null;
  passed: boolean | null;
  correctCount: number | null;
  questionCount: number;
}

export interface AttestationExamResultDto extends AttestationExamAttemptDto {
  results: Array<{
    questionId: string;
    selectedOptionId: string | null;
    correct: boolean;
    correctOptionId: string;
    explanation: string | null;
  }>;
  attestation: AttestationDto;
}

export const ATTESTATION_OUTCOMES = [
  'CORRESPONDS',
  'CORRESPONDS_WITH_RECOMMENDATIONS',
  'PROMOTE',
  'NOT_CORRESPONDS',
] as const;

export type AttestationOutcome = (typeof ATTESTATION_OUTCOMES)[number];

export const ATTESTATION_OUTCOME_LABEL: Record<AttestationOutcome, string> = {
  CORRESPONDS: 'Соответствует занимаемой должности',
  CORRESPONDS_WITH_RECOMMENDATIONS: 'Соответствует с рекомендациями',
  PROMOTE: 'Рекомендован к повышению',
  NOT_CORRESPONDS: 'Не соответствует занимаемой должности',
};

export interface AttestationPersonRef {
  id: string;
  fullName: string;
  position: string;
}

export interface AttestationDto {
  id: string;
  employee: AttestationPersonRef & { subjectCode: string; subjectShortName: string };
  periodLabel: string;
  status: AttestationStatus;
  knowledgeAttempt: Omit<AttestationExamAttemptDto, 'questions'> | null;
  selfScores: AttestationScores | null;
  selfComment: string | null;
  selfSubmittedAt: string | null;
  supervisor: AttestationPersonRef | null;
  supervisorScores: AttestationScores | null;
  supervisorComment: string | null;
  supervisorSubmittedAt: string | null;
  outcome: AttestationOutcome | null;
  decisionComment: string | null;
  decidedBy: AttestationPersonRef | null;
  decidedAt: string | null;
  /** Средний балл самооценки и оценки руководителя (для истории и динамики). */
  selfAverage: number | null;
  supervisorAverage: number | null;
  createdAt: string;
  version: number;
  /** Может ли текущий пользователь действовать на текущей стадии. */
  canSelfAssess: boolean;
  canTakeKnowledgeTest: boolean;
  canAllowKnowledgeRetake: boolean;
  canSupervisorAssess: boolean;
  canDecide: boolean;
  canCancel: boolean;
}

export interface AttestationListResponse {
  items: AttestationDto[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  inProgressCount: number;
}

/** Среднее по заполненным критериям, округлённое до десятых. `null` — нет оценок. */
export function averageScore(scores: AttestationScores | null | undefined): number | null {
  if (!scores) {
    return null;
  }
  const values = ATTESTATION_CRITERIA.map((criterion) => scores[criterion.code]).filter(
    (value): value is number => typeof value === 'number',
  );
  if (values.length === 0) {
    return null;
  }
  const sum = values.reduce((total, value) => total + value, 0);
  return Math.round((sum / values.length) * 10) / 10;
}
