import { describe, expect, it } from 'vitest';

import { createActivityEvidenceRef, parseActivityEvidenceRef } from './activity';

describe('ссылка на файл доказательства журнала', () => {
  it('сохраняет и восстанавливает метаданные файла', () => {
    const ref = createActivityEvidenceRef({
      uploaderId: 'profile-id',
      objectKey: 'activity/evidence/profile-id/object.pdf',
      fileName: 'Постановление № 7.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 1024,
    });

    expect(parseActivityEvidenceRef(ref)).toEqual({
      ref,
      uploaderId: 'profile-id',
      objectKey: 'activity/evidence/profile-id/object.pdf',
      fileName: 'Постановление № 7.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 1024,
    });
  });

  it('отклоняет повреждённую ссылку', () => {
    expect(parseActivityEvidenceRef('femida-activity-file:v1|%ZZ')).toBeNull();
  });
});
