import { mock } from 'jest-mock-extended';

const mockTranslate = mock<{ detect: () => any[]; translate: () => any[] }>();
import getTranslation from '../translations';

jest.mock('@google-cloud/translate', () => ({
  v2: {
    Translate: function () {
      return mockTranslate;
    },
  },
}));

describe('Text Translation', () => {
  it('should translate english', async () => {
    mockTranslate.detect.mockResolvedValue([
      { confidence: 1, language: 'en' },
    ] as never);
    mockTranslate.translate.mockResolvedValue(['text'] as never);
    expect(await getTranslation('english')).toBeDefined();
  });
  it('should translate turkish text', async () => {
    mockTranslate.detect.mockResolvedValue([
      { confidence: 1, language: 'tr' },
    ] as never);
    mockTranslate.translate.mockResolvedValue(['text'] as never);
    expect(await getTranslation('turkish')).toBeDefined();
  });
  it('should ignore text with low detection confidence', async () => {
    mockTranslate.detect.mockResolvedValue([
      { confidence: 0.5, language: 'en' },
    ] as never);
    expect(await getTranslation('text')).not.toBeDefined();
  });
  it('should ignore text thats not english or turkish', async () => {
    mockTranslate.detect.mockResolvedValue([
      { confidence: 1, language: 'fr' },
    ] as never);
    expect(await getTranslation('text')).not.toBeDefined();
  });
});
