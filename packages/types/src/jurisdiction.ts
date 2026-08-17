/**
 * Подведомственность обращений.
 *
 * Правила установлены статьями 2.4, 2.5 и 2.9 Регламента ГП-129:
 *   * жалобы на следователя, руководителя следственного органа, сотрудника
 *     прокуратуры и на решения суда рассматривает прокурор субъекта или его
 *     заместители (статья 2.4);
 *   * жалобы на прокуроров субъектов и сотрудников Генеральной прокуратуры
 *     рассматривает Генеральная прокуратура (статья 2.5);
 *   * обращения на действия Генерального прокурора не принимаются
 *     (статья 2.9).
 */

/** Предмет обжалования: чьи действия или решения обжалуются. */
export const COMPLAINT_TARGETS = [
  'NONE',
  'INVESTIGATOR',
  'PROSECUTOR_STAFF',
  'COURT',
  'SUBJECT_PROSECUTOR',
  'GENERAL_STAFF',
  'GENERAL_PROSECUTOR',
] as const;

export type ComplaintTarget = (typeof COMPLAINT_TARGETS)[number];

export const COMPLAINT_TARGET_LABEL: Record<ComplaintTarget, string> = {
  NONE: 'Обращение общего порядка',
  INVESTIGATOR: 'Следователь или руководитель следственного органа',
  PROSECUTOR_STAFF: 'Сотрудник прокуратуры',
  COURT: 'Суд: действия, приговор, определение, постановление',
  SUBJECT_PROSECUTOR: 'Прокурор субъекта',
  GENERAL_STAFF: 'Сотрудник Генеральной прокуратуры',
  GENERAL_PROSECUTOR: 'Генеральный прокурор',
};

/** Кто обязан рассмотреть обращение. Отображается пометкой в интерфейсе. */
export const JURISDICTION_LEVELS = ['ANY_EMPLOYEE', 'SUBJECT_PROSECUTOR', 'GENERAL'] as const;
export type JurisdictionLevel = (typeof JURISDICTION_LEVELS)[number];

export const JURISDICTION_LEVEL_LABEL: Record<JurisdictionLevel, string> = {
  ANY_EMPLOYEE: 'Рассматривается в общем порядке',
  SUBJECT_PROSECUTOR: 'Подлежит рассмотрению прокурором субъекта или его заместителем',
  GENERAL: 'Подлежит рассмотрению Генеральной прокуратурой',
};

export interface JurisdictionRule {
  /** Уровень рассмотрения — пометка, куда направляется обращение. */
  readonly level: JurisdictionLevel;
  /** Обращение принимается к регистрации. */
  readonly accepted: boolean;
  /** Субъект, в котором подлежит регистрации. `null` — любой доступный. */
  readonly requiredSubjectCode: string | null;
  /** Норма Регламента, на которой основано правило. */
  readonly article: string;
  /** Пояснение для интерфейса и сообщений об ошибке. */
  readonly note: string;
}

const RULES: Record<ComplaintTarget, JurisdictionRule> = {
  NONE: {
    level: 'ANY_EMPLOYEE',
    accepted: true,
    requiredSubjectCode: null,
    article: '—',
    note: 'Обращение рассматривается в общем порядке.',
  },
  INVESTIGATOR: {
    level: 'SUBJECT_PROSECUTOR',
    accepted: true,
    requiredSubjectCode: null,
    article: '2.4',
    note:
      'Жалоба на следователя или руководителя следственного органа принимается ' +
      'к рассмотрению прокурором субъекта или его заместителями.',
  },
  PROSECUTOR_STAFF: {
    level: 'SUBJECT_PROSECUTOR',
    accepted: true,
    requiredSubjectCode: null,
    article: '2.4',
    note:
      'Жалоба на сотрудника прокуратуры принимается к рассмотрению прокурором ' +
      'субъекта или его заместителями.',
  },
  COURT: {
    level: 'SUBJECT_PROSECUTOR',
    accepted: true,
    requiredSubjectCode: null,
    article: '2.4',
    note:
      'Жалоба на действия и решения суда принимается к рассмотрению прокурором ' +
      'субъекта или его заместителями.',
  },
  SUBJECT_PROSECUTOR: {
    level: 'GENERAL',
    accepted: true,
    requiredSubjectCode: 'GENERAL',
    article: '2.5',
    note: 'Жалоба на прокурора субъекта регистрируется Генеральной прокуратурой.',
  },
  GENERAL_STAFF: {
    level: 'GENERAL',
    accepted: true,
    requiredSubjectCode: 'GENERAL',
    article: '2.5',
    note:
      'Жалоба на сотрудника Генеральной прокуратуры регистрируется ' +
      'Генеральной прокуратурой.',
  },
  GENERAL_PROSECUTOR: {
    level: 'GENERAL',
    accepted: false,
    requiredSubjectCode: null,
    article: '2.9',
    note:
      'Обращения на действия Генерального прокурора не принимаются, его решения ' +
      'не обжалуются.',
  },
};

/** Правило подведомственности для выбранного предмета обжалования. */
export function resolveJurisdiction(target: ComplaintTarget): JurisdictionRule {
  return RULES[target];
}
