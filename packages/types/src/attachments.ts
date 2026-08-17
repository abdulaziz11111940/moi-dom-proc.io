/**
 * Вложения к записям реестра.
 *
 * Материал может быть загружен в хранилище документов либо приложен ссылкой,
 * если он размещён во внешнем ресурсе. Ссылки предусмотрены прежде всего для
 * записей видеофиксации приёма устных обращений (статья 2.6 Регламента ГП-129),
 * которые обычно хранятся отдельно из-за объёма.
 */

export const ATTACHMENT_KINDS = ['FILE', 'LINK'] as const;
export type AttachmentKind = (typeof ATTACHMENT_KINDS)[number];

export const ATTACHMENT_KIND_LABEL: Record<AttachmentKind, string> = {
  FILE: 'Файл',
  LINK: 'Ссылка',
};

export const ATTACHMENT_CATEGORIES = [
  'VIDEO_RECORDING',
  'DOCUMENT',
  'EVIDENCE',
  'RESPONSE',
  'OTHER',
] as const;
export type AttachmentCategory = (typeof ATTACHMENT_CATEGORIES)[number];

export const ATTACHMENT_CATEGORY_LABEL: Record<AttachmentCategory, string> = {
  VIDEO_RECORDING: 'Видеофиксация приёма',
  DOCUMENT: 'Документ',
  EVIDENCE: 'Материал по обращению',
  RESPONSE: 'Ответ заявителю',
  OTHER: 'Иное',
};

/**
 * Разрешённые типы загружаемых файлов.
 * Проверяется на сервере: расширение имени файла доверенным признаком не является.
 */
export const ALLOWED_ATTACHMENT_MIME_TYPES: readonly string[] = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'image/jpeg',
  'image/png',
  'image/webp',
  'video/mp4',
  'video/webm',
];

/** Предельный размер загружаемого файла — 25 МБ. */
export const MAX_ATTACHMENT_SIZE_BYTES = 25 * 1024 * 1024;

export function isAllowedAttachmentMimeType(mimeType: string): boolean {
  return ALLOWED_ATTACHMENT_MIME_TYPES.includes(mimeType.toLowerCase());
}

/** Вложение в представлении API. */
export interface AttachmentDto {
  id: string;
  kind: AttachmentKind;
  category: AttachmentCategory;
  title: string;
  description: string | null;
  /** Реквизиты файла; для ссылок — `null`. */
  fileName: string | null;
  mimeType: string | null;
  sizeBytes: number | null;
  checksum: string | null;
  /** Адрес внешнего материала; для файлов — `null`. */
  url: string | null;
  uploadedBy: { id: string; fullName: string; position: string } | null;
  createdAt: string;
  /** Доступно ли скачивание текущему пользователю. */
  canDownload: boolean;
  /** Может ли текущий пользователь удалить вложение. */
  canDelete: boolean;
}

/** Ответ на запрос ссылки для скачивания. */
export interface AttachmentDownloadDto {
  url: string;
  /** Срок действия ссылки в секундах. */
  expiresInSeconds: number;
  fileName: string;
}
