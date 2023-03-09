import { EMPTY, Observable, from, map, of } from 'rxjs';
import { marbles } from 'rxjs-marbles/jest';
import { ObservableState } from './observableState';

beforeAll(() => {
  jest.useFakeTimers();
});
afterEach(() => {
  jest.clearAllTimers();
});

test(
  'ObservableState acts as an Observable',
  marbles((m) => {
    const numbers = { 0: 0, 1: 1, 2: 2 };
    const source$ = m.hot('  -012', numbers);
    const expected$ = m.hot('1012', numbers);

    const os = new ObservableState('name', source$, 1);
    const observable: Observable<number> = from(os);
    m.expect(observable).toBeObservable(expected$);
    os.connect();
  })
);

test(
  'ObservableState subscribes and unsubscribes to the source when connect and unsubscribe are called',
  marbles((m) => {
    const source$ = m.hot('  abcd|');
    const triggers$ = m.hot('-1-| ');
    const expectedSub = '    -^-! ';

    const os = new ObservableState('name', source$, 'a');
    triggers$.subscribe({
      next: () => os.connect(),
      complete: () => os.unsubscribe(),
    });

    m.expect(source$).toHaveSubscriptions(expectedSub);
  })
);

test('ObservableState exposes the latest state', () => {
  const initial = Symbol('initial');
  const emitted = Symbol('emitted');

  const os = new ObservableState<symbol>('name', of(emitted), initial);

  expect(os.state).toEqual(initial);
  os.connect();
  expect(os.state).toEqual(emitted);
});

test('ObservableState throws error when accessing state after unsubscribe', () => {
  const os = new ObservableState('name', EMPTY, 1);
  os.connect();
  os.unsubscribe();
  expect(() => os.state).toThrow();
});

test('ObservableState throws error when subscribing after unsubscribe', () => {
  const os = new ObservableState('name', EMPTY, 1);
  os.connect();
  os.unsubscribe();

  const completeSpy = jest.fn();
  const errorSpy = jest.fn();
  expect(() =>
    os.subscribe({
      complete: completeSpy,
      error: errorSpy,
    })
  ).toThrow();
});

test('ObservableState can be subscribed', () => {
  const os = new ObservableState('name', of(1), 0);
  const completeSpy = jest.fn();

  os.subscribe({
    complete: completeSpy,
    error: () => fail(),
  });

  os.connect();
  jest.runAllTimers();
  expect(completeSpy).toHaveBeenCalled();
});

test(
  'ObservableState can be piped',
  marbles((m) => {
    const source$ = m.hot('  -123');
    const expected$ = m.hot('0149');

    const os = new ObservableState('name', source$, 0);

    m.expect(os.pipe(map((v) => `${v * v}`))).toBeObservable(expected$);
    os.connect();
  })
);

test(
  'ObservableState emits intial state and first source in same frame',
  marbles((m) => {
    const source$ = m.hot(' b');
    const expected$ = '  (ab)';

    const os = new ObservableState('name', source$, 'a');

    m.expect(from(os)).toBeObservable(expected$);
    os.connect();
  })
);
