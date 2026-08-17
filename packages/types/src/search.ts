/** Глобальный поиск по сотрудникам, обращениям, проверкам и журналу деятельности. */
export const SEARCH_RESULT_TYPES = ['EMPLOYEE', 'APPEAL', 'INSPECTION', 'ACTIVITY_RECORD'] as const;
export type SearchResultType = (typeof SEARCH_RESULT_TYPES)[number];

export const SEARCH_RESULT_TYPE_LABEL: Record<SearchResultType, string> = {
  EMPLOYEE: 'Сотрудники',
  APPEAL: 'Обращения',
  INSPECTION: 'Проверки',
  ACTIVITY_RECORD: 'Журнал деятельности',
};

export interface SearchResultItem {
  type: SearchResultType;
  id: string;
  title: string;
  subtitle: string;
  href: string;
  subject: { code: string; shortName: string } | null;
}

export interface SearchResponse {
  query: string;
  items: SearchResultItem[];
}
