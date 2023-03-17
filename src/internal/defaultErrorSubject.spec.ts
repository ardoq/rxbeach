import { defaultErrorSubject } from './defaultErrorSubject';

beforeAll(() => {
  jest.useFakeTimers();
});

test('defaultErrorSubject rethrows errors globally', () => {
  const error = new Error('Hello errors');
  defaultErrorSubject.next(error);

  expect(jest.runAllTimers).toThrow(error);
});
