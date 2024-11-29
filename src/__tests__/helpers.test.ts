import store from '../store';
import * as helpers from '../helpers';
import messages from './messages.json';
jest.mock('../store');
const mockMessages: any = messages;
const mockedStore = store as jest.Mocked<typeof store>;
describe('Helper Functions', () => {
  test('Check group jid', () => {
    expect(helpers.checkIsGroup('905338689105-1633700305@g.us')).toBe(true);
    expect(helpers.checkIsGroup('905338398892@s.whatsapp.net')).toBe(false);
  });
  test('Check if translations are paused', () => {
    mockedStore.get.mockReturnValue(true);
    expect(helpers.translationsArePaused('jid')).toBe(true);
  });
  test('Check if should translate Text', () => {
    expect(helpers.shouldTranslateText('😀😃🍀')).toBe(false);
    expect(helpers.shouldTranslateText('@1234567890 @1234567890')).toBe(false);
    expect(helpers.shouldTranslateText('https://google.com/')).toBe(false);
    expect(helpers.shouldTranslateText('123456789')).toBe(false);
    expect(helpers.shouldTranslateText('hello friend 😀😃')).toBe(true);
  });
  test('Strip extened text', () => {
    expect(
      helpers.stripExtendedText(
        'https://example.com/ text https://example2.com/'
      )
    ).toEqual([
      '{1} text {2}',
      ['https://example.com/', 'https://example2.com/'],
    ]);
    expect(helpers.stripExtendedText('@1234567890 text')).toEqual([
      '{1} text',
      ['@1234567890'],
    ]);
  });
  test('Merge extened text', () => {
    expect(
      helpers.mergeExtendedText('{1} text {2}', [
        'https://example.com/',
        'https://example2.com/',
      ])
    ).toBe('https://example.com/ text https://example2.com/');
    expect(helpers.mergeExtendedText('{1} text', ['@1234567890'])).toEqual(
      '@1234567890 text'
    );
  });

  test('Checks if message contains mentions', () => {
    expect(helpers.hasMentions(mockMessages.mention)).toEqual([
      '123456789@s.whatsapp.net',
    ]);
    expect(helpers.hasMentions(mockMessages.conversation)).toEqual(false);
  });
});

describe('Text Extraction', () => {
  it('Should extract text from images with caption', () => {
    expect(typeof helpers.extractMessageText(mockMessages.imageWithText)).toBe(
      'string'
    );
    expect(helpers.extractMessageText(mockMessages.image)).toBeUndefined();
  });
  it('Should extract text from videos with caption', () => {
    expect(typeof helpers.extractMessageText(mockMessages.videoWithText)).toBe(
      'string'
    );
    expect(helpers.extractMessageText(mockMessages.video)).toBeUndefined();
  });
  it('Should extract text from normal text messages', () => {
    expect(typeof helpers.extractMessageText(mockMessages.conversation)).toBe(
      'string'
    );
  });
  it('Should extract text from mentions', () => {
    expect(typeof helpers.extractMessageText(mockMessages.mention)).toBe(
      'string'
    );
  });
  it('Should extract text from extended text', () => {
    expect(typeof helpers.extractMessageText(mockMessages.text)).toBe('string');
  });
});
