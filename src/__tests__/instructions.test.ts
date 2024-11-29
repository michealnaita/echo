import store from '../store';
import execInstruction from '../instructions';
jest.mock('../store');
const storeMock = store as jest.Mocked<typeof store>;

describe('Agent Instructions', () => {
  afterEach(() => {
    storeMock.set.mockReset();
    storeMock.del.mockReset();
  });
  test('Listens to pause instruction', () => {
    const reply = execInstruction('@1234567890', '@123456 pause');
    expect(typeof reply).toBe('string');
    expect(storeMock.set).toHaveBeenCalled();
  });
  test('Listens to unpause instruction', () => {
    const reply = execInstruction('@1234567890', '@123456 unpause');
    expect(typeof reply).toBe('string');
    expect(storeMock.del).toHaveBeenCalled();
  });
  test('Ignores unknown instructions', () => {
    const reply = execInstruction('@1234567890', '@123456 any');
    expect(reply).toBeFalsy();
    expect(storeMock.set).not.toHaveBeenCalled();
  });
});
