import {
  ATTESTATION_CRITERIA,
  ATTESTATION_OUTCOMES,
  ATTESTATION_QUESTION_DIFFICULTIES,
  ATTESTATION_SCORE_MAX,
  ATTESTATION_SCORE_MIN,
  ATTESTATION_STATUSES,
  SUBJECT_CODES,
} from '@femida/types';
import { z } from 'zod';

const criterionCodes = ATTESTATION_CRITERIA.map((criterion) => criterion.code) as [
  string,
  ...string[],
];

/** Оценки по всем критериям: каждый критерий обязателен, балл 1..5. */
const scoresSchema = z
  .record(
    z.enum(criterionCodes),
    z.coerce.number().int().min(ATTESTATION_SCORE_MIN).max(ATTESTATION_SCORE_MAX),
  )
  .refine(
    (value) => ATTESTATION_CRITERIA.every((criterion) => typeof value[criterion.code] === 'number'),
    {
      message: 'Оцените все критерии',
    },
  );

export const attestationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(5).max(100).default(20),
  status: z.enum(ATTESTATION_STATUSES).optional(),
  subjectCode: z.enum(SUBJECT_CODES).optional(),
  userProfileId: z.string().uuid().optional(),
  search: z.string().trim().max(191).optional(),
});

export type AttestationQueryInput = z.infer<typeof attestationQuerySchema>;

export const createAttestationSchema = z.object({
  userProfileId: z.string().uuid(),
  periodLabel: z
    .string()
    .trim()
    .regex(
      /^(Январь|Февраль|Март|Апрель|Май|Июнь|Июль|Август|Сентябрь|Октябрь|Ноябрь|Декабрь) \d{4}$/u,
      'Укажите месяц аттестации',
    ),
});

export type CreateAttestationInput = z.infer<typeof createAttestationSchema>;

const commentSchema = z.string().trim().max(2000).optional().or(z.literal(''));

export const attestationAssessmentSchema = z.object({
  scores: scoresSchema,
  comment: commentSchema,
  version: z.number().int().positive(),
});

export type AttestationAssessmentInput = z.infer<typeof attestationAssessmentSchema>;

export const attestationDecisionSchema = z.object({
  outcome: z.enum(ATTESTATION_OUTCOMES),
  comment: z.string().trim().min(5, 'Укажите обоснование решения').max(2000),
  version: z.number().int().positive(),
});

export type AttestationDecisionInput = z.infer<typeof attestationDecisionSchema>;

export const attestationCancelSchema = z.object({
  version: z.number().int().positive(),
});

export type AttestationCancelInput = z.infer<typeof attestationCancelSchema>;

const questionOptionSchema = z.object({
  id: z.string().trim().min(1).max(32),
  text: z.string().trim().min(1).max(500),
});

export const attestationQuestionSchema = z
  .object({
    actTitle: z.string().trim().min(3).max(300),
    articleRef: z.string().trim().max(100).optional().or(z.literal('')),
    sourceUrl: z.string().trim().url().max(1000),
    prompt: z.string().trim().min(10).max(2000),
    options: z.array(questionOptionSchema).min(2).max(6),
    correctOptionId: z.string().trim().min(1).max(32),
    explanation: z.string().trim().max(2000).optional().or(z.literal('')),
    difficulty: z.enum(ATTESTATION_QUESTION_DIFFICULTIES),
    isActive: z.boolean().default(true),
  })
  .refine(
    (value) => new Set(value.options.map((option) => option.id)).size === value.options.length,
    {
      message: 'Идентификаторы вариантов ответа должны быть уникальными',
      path: ['options'],
    },
  )
  .refine((value) => value.options.some((option) => option.id === value.correctOptionId), {
    message: 'Правильный ответ должен присутствовать среди вариантов',
    path: ['correctOptionId'],
  });

export type AttestationQuestionInput = z.infer<typeof attestationQuestionSchema>;

export const attestationExamSubmitSchema = z.object({
  answers: z.record(z.string().uuid(), z.string().trim().min(1).max(32)),
});

export type AttestationExamSubmitInput = z.infer<typeof attestationExamSubmitSchema>;
