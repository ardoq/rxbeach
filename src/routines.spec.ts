import { Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { marbles } from 'rxjs-marbles/jest';
import { Action } from './types/Action';
import {
  Routine,
  collectRoutines,
  ensureArray,
  routine,
  subscribeRoutine,
  tapRoutine,
} from './routines';
import { mockAction } from './internal/testing/utils';
import { extractPayload } from './operators/operators';
import { actionCreator } from './actionCreator';

beforeAll(() => {
  jest.useFakeTimers();
});

const marbleMap: Record<string, any> = {
  a: mockAction('[Mock] alpha', undefined, { letter: 'A' }),
  b: mockAction('[Mock] bravo', undefined, { letter: 'B' }),
  c: mockAction('[Mock] charlie', undefined, { letter: 'C' }),
  e: mockAction('[Mock] error'),
  f: mockAction('[Mock] action', undefined, { letter: 'F' }),
};

// Add letter representations to marble map
for (let i = 'A'.charCodeAt(0); i < 'Z'.charCodeAt(0); i++) {
  const letter = String.fromCharCode(i);
  marbleMap[letter] = letter;
}
// Add number representations to marble map
for (let i = 0; i < 10; i++) {
  // Create marble representations of the 10 first characters
  // eg. { A: 'A', B: 'B', ...etc }
  const charCodeA = 'A'.charCodeAt(0);
  const letter = String.fromCharCode(charCodeA + i);
  marbleMap[letter] = letter;
  // Create marble representations of the 10 first numbers from 0
  marbleMap[`${i}`] = i;
}

const errors = {
  e: 'error',
};
const actionMarbles1 = ' -a----b----c---';
const letterMarbles = '  -A----B----C---';
const combinedMarbles = '-(A0)-(B1)-(C2)';
const actionMarbles2 = ' -a----e----a---';
const errorMarbles = '   ------e';
const errorSub1 = '      ^-----!';
const errorSub2 = '      ------^--------';
const singleActionMarble = '  -f---f';

const errorRoutine: Routine<string> = map((a) => {
  if (a.type === '[Mock] error') throw 'error';
  return 'passed';
});
const lettersRoutine = routine(
  filter((action: unknown): action is Action<{ letter: string }> => {
    const { payload } = action as Action<{ letter: string }>;
    return Boolean(payload.letter);
  }),
  extractPayload(),
  map(({ letter }) => letter)
);

const letterToNumberRoutine = routine(
  map((action) => {
    const { payload } = action as Action<{ letter: string }>;
    return payload.letter.charCodeAt(0) - 'A'.charCodeAt(0);
  })
);

test(
  'routine pipes multiple operator functions',
  marbles((m) => {
    const action$ = m.hot(actionMarbles1, marbleMap);
    const expected$ = m.hot(letterMarbles, marbleMap);

    const actual$ = action$.pipe(lettersRoutine);

    m.expect(actual$).toBeObservable(expected$);
  })
);

test(
  'collectRoutines runs all routines',
  marbles((m) => {
    const action$ = m.hot(actionMarbles1, marbleMap);
    const expected$ = m.hot(combinedMarbles, marbleMap);
    const actual$ = action$.pipe(
      collectRoutines(lettersRoutine, letterToNumberRoutine)
    );
    m.expect(actual$).toBeObservable(expected$);
  })
);

test(
  'subscribeRoutine subscribes action$',
  marbles((m) => {
    const action$ = m.hot(actionMarbles1, marbleMap);
    subscribeRoutine(action$, lettersRoutine);

    m.expect(action$).toHaveSubscriptions(['^']);
  })
);

test(
  'subscribeRoutine resubscribes on errors',
  marbles((m) => {
    const action$ = m.hot(actionMarbles2, marbleMap);

    subscribeRoutine(action$, errorRoutine);

    m.expect(action$).toHaveSubscriptions([errorSub1, errorSub2]);
  })
);

test(
  'subscribeRoutine emits errors to error subject',
  marbles((m) => {
    const action$ = m.hot(actionMarbles2, marbleMap);
    const error$ = new Subject<any>();

    subscribeRoutine(action$, errorRoutine, error$);

    m.expect(error$).toBeObservable(errorMarbles, errors);
  })
);

test(
  'tapRoutine register a routine',
  marbles((m) => {
    const action$ = m.hot(singleActionMarble, marbleMap);
    const action = actionCreator<{ letter: string }>('[Mock] action');
    expect.assertions(2);
    const routineToSubscribe = tapRoutine(action, (payload) =>
      expect(payload.letter).toBe('F')
    );
    subscribeRoutine(action$, routineToSubscribe);
  })
);

test('ensureArray return an Array', () => {
  expect(Array.isArray(ensureArray('a'))).toBe(true);
  expect(Array.isArray(ensureArray(['a']))).toBe(true);
});
