import listeners from '../listeners';
import execInstruction from '../instructions';
import * as helpers from '../helpers';
import { mock, MockProxy } from 'jest-mock-extended';
import { Socket } from '../types';

jest.mock('../helpers', () => ({
  checkIsGroup: jest.fn(() => true),
  translationsArePaused: jest.fn(() => false),
  extractMessageText: jest.fn(() => 'text'),
  shouldTranslateText: jest.fn(() => true),
  isMediaMessage: jest.fn(() => false),
  isInstruction: jest.fn(() => false),
  hasMentions: jest.fn(() => false),
}));
jest.mock('../instructions');
jest.mock('../translations', () => jest.fn(async () => 'text'));

const execInstructionMock = execInstruction as unknown as jest.Mock<
  string | undefined
>;
const events: any = {
  'messages.upsert': {
    type: 'notify',
    messages: [
      {
        key: {
          fromMe: false,
          remoteJid: '',
        },
      },
    ],
  },
};
const mockedHelpers = helpers as jest.Mocked<typeof helpers>;

describe('Messages listener', () => {
  let mockedSocket: MockProxy<Socket>;
  beforeEach(() => {
    mockedSocket = mock<Socket>();
  });
  test('Ignore none group messages', async () => {
    mockedHelpers.checkIsGroup.mockReturnValueOnce(false);
    await listeners(mockedSocket)(events);
    expect(mockedSocket.sendMessage).not.toHaveBeenCalled();
  });
  test('Ignore if translations have been paused', async () => {
    mockedHelpers.translationsArePaused.mockReturnValueOnce(true);
    await listeners(mockedSocket)(events);
    expect(mockedSocket.sendMessage).not.toHaveBeenCalled();
  });
  test('Ignore unecessary translations', async () => {
    mockedHelpers.shouldTranslateText.mockReturnValueOnce(false);
    await listeners(mockedSocket)(events);
    expect(mockedSocket.sendMessage).not.toHaveBeenCalled();
  });
  test('Ignore messages that dont contain text', async () => {
    mockedHelpers.extractMessageText.mockReturnValueOnce(undefined);
    await listeners(mockedSocket)(events);
    expect(mockedSocket.sendMessage).not.toHaveBeenCalled();
  });
  test('Execute instrcution and reply to message', async () => {
    execInstructionMock.mockReturnValue('done');
    mockedHelpers.isInstruction.mockReturnValueOnce(true);
    await listeners(mockedSocket)(events);
    expect(mockedSocket.sendMessage).toHaveBeenCalled();
    expect(execInstructionMock).toHaveBeenCalled();
  });
  test('Ignore messages from self', async () => {
    const mockedEvent = JSON.parse(JSON.stringify(events));
    mockedEvent['messages.upsert'].messages[0].key.fromMe = true;
    await listeners(mockedSocket)(mockedEvent);
    expect(mockedSocket.sendMessage).not.toHaveBeenCalled();
  });
  test('Sends messages back to group', async () => {
    await listeners(mockedSocket)(events);
    expect(mockedSocket.sendMessage).toHaveBeenCalled();
  });
});
