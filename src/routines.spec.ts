import untypedTest from 'ava';
import { Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { marbles } from 'rxjs-marbles/ava';
import { ActionWithPayload } from './types/Action';
import { Routine, routine } from './routines';
import { mockAction, stubRethrowErrorGlobally } from './internal/testing/utils';
import { extractPayload } from './operators/operators';
import { routinesRegistry } from './routinesRegistry';

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
const errors = {
  e: 'error',
};
const actionMarbles1 = ' -a----b----c---';
const letterMarbles = '  -A----B----C---';
const actionMarbles2 = ' -a----e----a---';
const errorMarbles = '   ------e';
const errorSub1 = '      ^-----!';
const errorSub2 = '      ------^--------';

const errorRoutine: Routine<string> = map((a) => {
  if (a.type === 'error') throw 'error';
  return 'passed';
});

test.serial.afterEach(() => {
  routinesRegistry.clearRegistery();
});

const createRoutine = () =>
  routine(
    filter(
      (action: any): action is ActionWithPayload<{ letter: string }> =>
        action.payload !== undefined
    ),
    extractPayload(),
    map(({ letter }) => letter)
  );

test.serial(
  'routine pipes multiple operator functions',
  marbles((m) => {
    const lettersRoutine = createRoutine();
    const action$ = m.hot(actionMarbles1, actions);
    const expected$ = m.hot(letterMarbles, letters);
    routinesRegistry.startRoutines(action$);

    const actual$ = action$.pipe(lettersRoutine);
    m.expect(actual$).toBeObservable(expected$);
  })
);

test.serial(
  'subscribeRoutine subscribes action$',
  marbles((m) => {
    createRoutine();
    const action$ = m.hot(actionMarbles1, actions);
    routinesRegistry.startRoutines(action$);

    m.expect(action$).toHaveSubscriptions(['^']);
  })
);

test.serial(
  'routine should be subscribed when it registered after the routines has started',
  marbles((m) => {
    const action$ = m.hot(actionMarbles1, actions);
    routinesRegistry.startRoutines(action$);
    createRoutine();

    m.expect(action$).toHaveSubscriptions(['^']);
  })
);

test.serial(
  'subscribeRoutine resubscribes on errors',
  marbles((m) => {
    const action$ = m.hot(actionMarbles2, actions);

    routine(errorRoutine);
    routinesRegistry.startRoutines(action$);
    m.expect(action$).toHaveSubscriptions([errorSub1, errorSub2]);
  })
);

test.serial(
  'subscribeRoutine emits errors to error subject',
  marbles((m) => {
    const action$ = m.hot(actionMarbles2, actions);
    const error$ = new Subject<any>();
    routine(errorRoutine);
    routinesRegistry.startRoutines(action$, error$);

    m.expect(error$).toBeObservable(errorMarbles, errors);
  })
);
