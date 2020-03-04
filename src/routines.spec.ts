import untypedTest from 'ava';
import { Subject } from 'rxjs';
import { map, filter } from 'rxjs/operators';
import { marbles } from 'rxjs-marbles/ava';
import {
  ActionWithPayload,
  Routine,
  subscribeRoutine,
  routine,
  collectRoutines,
} from 'rxbeach';
import {
  mockAction,
  stubRethrowErrorGlobally,
} from 'rxbeach/internal/testing/utils';
import { extractPayload } from 'rxbeach/operators';

const test = stubRethrowErrorGlobally(untypedTest);

const actions = {
  a: mockAction('alpha', undefined, { letter: 'A' }),
  b: mockAction('bravo', undefined, { letter: 'B' }),
  c: mockAction('charlie', undefined, { letter: 'C' }),
  e: mockAction('error'),
};
const letters = {
  A: 'A',
  B: 'B',
  C: 'C',
};
const lengths = {
  ...letters,
  '5': 5,
  '7': 7,
};
const errors = {
  e: 'error',
};
const actionMarbles1 = ' -a----b----c---';
const letterMarbles = '  -A----B----C---';
const combinedMarbles = '-(A5)-(B5)-(C7)';
const actionMarbles2 = ' -a----e----a---';
const errorMarbles = '   ------e';
const errorSub1 = '      ^-----!';
const errorSub2 = '      ------^--------';

const errorRoutine: Routine<string> = map(a => {
  if (a.type === 'error') throw 'error';
  return 'passed';
});
const lettersRoutine = routine(
  filter(
    (action: any): action is ActionWithPayload<{ letter: string }> =>
      action.payload !== undefined
  ),
  extractPayload(),
  map(({ letter }) => letter)
);
const lengthRoutine = routine(map(({ type }) => type.length));

test(
  'routine pipes multiple operator functions',
  marbles(m => {
    const action$ = m.hot(actionMarbles1, actions);
    const expected$ = m.hot(letterMarbles, letters);

    const actual$ = action$.pipe(lettersRoutine);

    m.expect(actual$).toBeObservable(expected$);
  })
);

test(
  'collectRoutines runs all routines',
  marbles(m => {
    const action$ = m.hot(actionMarbles1, actions);
    const expected$ = m.hot(combinedMarbles, lengths);

    const actual$ = action$.pipe(
      collectRoutines(lettersRoutine, lengthRoutine)
    );

    m.expect(actual$).toBeObservable(expected$);
  })
);

test(
  'subscribeRoutine subscribes action$',
  marbles(m => {
    const action$ = m.hot(actionMarbles1, actions);
    subscribeRoutine(action$, lettersRoutine);

    m.expect(action$).toHaveSubscriptions(['^']);
  })
);

test(
  'subscribeRoutine resubscribes on errors',
  marbles(m => {
    const action$ = m.hot(actionMarbles2, actions);

    subscribeRoutine(action$, errorRoutine);

    m.expect(action$).toHaveSubscriptions([errorSub1, errorSub2]);
  })
);

test(
  'subscribeRoutine emits errors to error subject',
  marbles(m => {
    const action$ = m.hot(actionMarbles2, actions);
    const error$ = new Subject<any>();

    subscribeRoutine(action$, errorRoutine, error$);

    m.expect(error$).toBeObservable(errorMarbles, errors);
  })
);
