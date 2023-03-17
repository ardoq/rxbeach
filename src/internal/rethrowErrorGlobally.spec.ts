import { rethrowErrorGlobally } from '../internal/rethrowErrorGlobally';

beforeAll(() => {
  jest.useFakeTimers();
});
beforeEach(() => {
  jest.clearAllTimers();
});

test('rethrows error globally', () => {
  const error = new Error('Hello errors!');

  rethrowErrorGlobally(error);
  expect(jest.runAllTimers).toThrowError();
});
