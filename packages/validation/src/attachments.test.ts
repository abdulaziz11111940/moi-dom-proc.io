import { describe, expect, it } from 'vitest';

import { attachmentUrlSchema, createLinkAttachmentSchema } from './attachments';

describe('attachmentUrlSchema', () => {
  it('принимает адреса http и https', () => {
    expect(attachmentUrlSchema.safeParse('https://example.org/record').success).toBe(true);
    expect(attachmentUrlSchema.safeParse('http://example.org/record').success).toBe(true);
  });

  // Ссылка с иной схемой позволяет выполнить код в браузере пользователя
  // либо обратиться к локальным ресурсам.
  it.each([
    'javascript:alert(1)',
    'data:text/html;base64,PHNjcmlwdD4=',
    'file:///C:/windows/system32',
    'ftp://example.org/file',
  ])('отклоняет небезопасную схему %s', (value) => {
    expect(attachmentUrlSchema.safeParse(value).success).toBe(false);
  });

  it('отклоняет строку, не являющуюся адресом', () => {
    expect(attachmentUrlSchema.safeParse('просто текст').success).toBe(false);
  });
});

describe('createLinkAttachmentSchema', () => {
  const valid = {
    title: 'Запись видеофиксации приёма',
    category: 'VIDEO_RECORDING' as const,
    url: 'https://example.org/records/2026-07-22',
  };

  it('принимает корректные данные', () => {
    expect(createLinkAttachmentSchema.safeParse(valid).success).toBe(true);
  });

  it('по умолчанию назначение — «иное»', () => {
    const result = createLinkAttachmentSchema.parse({ title: valid.title, url: valid.url });
    expect(result.category).toBe('OTHER');
  });

  it('требует название не короче трёх символов', () => {
    expect(createLinkAttachmentSchema.safeParse({ ...valid, title: 'ак' }).success).toBe(false);
  });
});
