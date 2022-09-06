import test from 'ava';
import { combineLatest, from, map } from 'rxjs';
import { marbles } from 'rxjs-marbles/ava';
import { incrementMocks } from './internal/testing/mock';
import { persistentDerivedStream } from './persistentDerivedStream';
import { persistentReducedStream } from './persistentReducedStream';
import { ActionStream } from './types/helpers';

const { reducers } = incrementMocks;
const { actions, numbers } = incrementMocks.marbles;
const reducerArray = Object.values(reducers);

let counter = 1;
const nextStreamName = () => `testStream-${counter++}`;

const getTestObservableState = (action$: ActionStream) => {
  const state$ = persistentReducedStream<number>(
    nextStreamName(),
    1,
    reducerArray,
    {
      action$,
    }
  );
  state$.connect();
  return state$;
};

test(
  'persistentDerivedStream should subscribe to its source.',
  marbles((m) => {
    const action$ = m.hot('  ----1--2-----1', actions);
    const number$ = m.hot('  --2----1------', numbers);
    const expected$ = m.hot('2-3-4--(65)--6', numbers);

    const state$ = getTestObservableState(action$);

    const derivedState$ = persistentDerivedStream<number>(
      nextStreamName(),
      combineLatest([state$, number$]).pipe(map(([n, n2]) => n + n2)),
      2
    );
    derivedState$.connect();
    m.expect(from(derivedState$)).toBeObservable(expected$);
  })
);

test(
  'persistentDerivedStream should expose the state of its source.',
  marbles((m, t) => {
    const action$ = m.hot('  --1---2-----1', actions);
    const number$ = m.hot('  -1-------7---', numbers);

    const initialState: [number, number] = [0, 0];
    const state$ = getTestObservableState(action$);

    const derivedState$ = persistentDerivedStream<[number, number]>(
      nextStreamName(),
      combineLatest([number$, state$]),
      initialState
    );
    derivedState$.connect();
    m.flush();
    t.deepEqual(derivedState$.state, [7, 5]);
  })
);
