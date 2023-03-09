import { persistentReducedStream } from './persistentReducedStream';
import { Subject, from, map, of } from 'rxjs';
import { marbles } from 'rxjs-marbles/jest';
import { incrementMocks } from './internal/testing/mock';
import { reducer } from './reducer';

const { reducers, actionCreators, handlers } = incrementMocks;
const { actions, numbers, errors } = incrementMocks.marbles;
const reducerArray = Object.values(reducers);

let counter = 1;
const nextStreamName = () => `testStream-${counter++}`;

afterEach(() => {
  handlers.incrementOne.mockClear();
});

test('persistentReducedStream should expose its state immediately', () => {
  const state = 'hello';
  const state$ = persistentReducedStream(nextStreamName(), state, []);

  expect(state$.state).toEqual(state);
});

test('persistentReducedStream should not initially be destoryed', () => {
  const state$ = persistentReducedStream(nextStreamName(), null, []);

  expect(state$.destroyed).toBe(false);
});

test(
  'persistentReducedStream reduces state',
  marbles((m) => {
    const action$ = m.hot('  --1-', actions);
    const expected$ = m.hot('1-2-', numbers);
    const initialState = 1;

    const state$ = persistentReducedStream(
      nextStreamName(),
      initialState,
      reducerArray,
      {
        action$,
      }
    );
    state$.connect();

    m.expect(from(state$)).toBeObservable(expected$);

    m.flush();
    expect(state$.state).toEqual(numbers[2]);
  })
);

test(
  'persistentReducedStream should support piping',
  marbles((m) => {
    const action$ = m.hot('-1-1', actions);
    const expected = '     02-4';

    const state$ = persistentReducedStream(nextStreamName(), 0, reducerArray, {
      action$,
    });
    state$.connect();
    const actual$ = state$.pipe(map((a) => `${a * 2}`));

    m.expect(actual$).toBeObservable(expected);
  })
);

test('persistentReducedStream should call reducer once when there are multiple subs', () => {
  const initialState = 1;
  const action$ = of(actionCreators.incrementOne());
  const state$ = persistentReducedStream(
    nextStreamName(),
    initialState,
    reducerArray,
    {
      action$,
    }
  );

  state$.connect();

  const sub1 = state$.subscribe();
  const sub2 = state$.subscribe();
  expect(handlers.incrementOne).toHaveBeenCalledTimes(1);
  sub1.unsubscribe();
  sub2.unsubscribe();
});

test(
  'persistentReducedStream should ignore actions, but emit initial state before it starts reducing',
  marbles((m) => {
    const action$ = m.hot('-1-1', actions);
    const expected = '     0---';

    const state$ = persistentReducedStream(nextStreamName(), 0, reducerArray, {
      action$,
    });
    const actual$ = state$.pipe(map((a) => `${a * 2}`));
    action$.subscribe();

    m.expect(actual$).toBeObservable(expected);
  })
);

test(
  'persistentReducedStream keeps reducing even though it has no subscribers',
  marbles((m) => {
    const initialState = 1;
    const action$ = m.hot('      -1-1-1-', actions);
    const sub1 = '               ^-!----';
    const sub1Expected$ = m.hot('12-----', numbers);
    const sub2 = '               ----^-!';
    const sub2Expected$ = m.hot('----34-', numbers);
    const state$ = persistentReducedStream(
      nextStreamName(),
      initialState,
      reducerArray,
      {
        action$,
      }
    );

    state$.connect();

    m.expect(from(state$), sub1).toBeObservable(sub1Expected$);
    m.expect(from(state$), sub2).toBeObservable(sub2Expected$);
  })
);

test(
  'persistentReducedStream internal subject should close when reducing is stopped',
  marbles((m) => {
    const trigger = m.hot('  --|');
    const action$ = m.hot('  -1-1', actions);
    const expected$ = m.hot('12--', numbers);
    const subscription = '   ^-!';

    const state$ = persistentReducedStream(nextStreamName(), 1, reducerArray, {
      action$,
    });
    state$.connect();
    trigger.subscribe({ complete: () => state$.unsubscribe() });

    m.expect(from(state$)).toBeObservable(expected$);
    m.expect(action$).toHaveSubscriptions(subscription);

    m.flush();
    expect(state$.destroyed).toBe(true);
  })
);

test(
  'persistentReducedStream should not allow to restart reducing after stopping',
  marbles((m) => {
    const trigger = m.hot('  ---|');
    const action$ = m.hot('  -1--1--', actions);
    const subscription = '   ^-!';
    const expected$ = m.hot('12--', numbers);

    const state$ = persistentReducedStream(nextStreamName(), 1, reducerArray, {
      action$,
    });
    state$.connect();
    trigger.subscribe({
      complete: () => {
        state$.unsubscribe();
        try {
          state$.connect();
          fail('connect should throw an error');
          // eslint-disable-next-line no-empty
        } catch {}
      },
    });
    m.expect(from(state$), subscription).toBeObservable(expected$);
    m.flush();
    expect(state$.destroyed).toBe(true);
  })
);

test(
  'persistentReducedStream should not emit when it starts reducing',
  marbles((m) => {
    const trigger = m.hot('  -|--');
    const action$ = m.hot('  1--1', actions);
    const expected$ = m.hot('1--2', numbers);
    const subscription = '   -^---';

    const state$ = persistentReducedStream(nextStreamName(), 1, reducerArray, {
      action$,
    });
    trigger.subscribe({ complete: () => state$.connect() });

    m.expect(from(state$)).toBeObservable(expected$);
    m.expect(action$).toHaveSubscriptions(subscription);
  })
);

test(
  'persistentReducedStream catches errors and emits them to error subject',
  marbles((m) => {
    const action$ = m.hot('  -d-1', actions);
    const expected$ = m.hot('1--2', numbers);
    const errorMarbles = '   -e-';
    const error$ = new Subject<any>();

    const state$ = persistentReducedStream(nextStreamName(), 1, reducerArray, {
      errorSubject: error$,
      action$,
    });
    m.expect(error$).toBeObservable(errorMarbles, errors);
    m.expect(from(state$)).toBeObservable(expected$);
    state$.connect();
  })
);

test('persistentReducedStream should throw exception when accessing state after stopped reducing', () => {
  const state$ = persistentReducedStream(nextStreamName(), 1, reducerArray);
  state$.unsubscribe();

  expect(() => state$.state).toThrow();
});

test(
  'persistentReducedStream only reduces action with correct namespace',
  marbles((m) => {
    const action$ = m.hot('  --mn-', actions);
    const expected$ = m.hot('1--2-', numbers);
    const initialState = 1;

    const state$ = persistentReducedStream(
      nextStreamName(),
      initialState,
      reducerArray,
      { namespace: incrementMocks.namespace, action$ }
    );
    state$.connect();

    m.expect(from(state$)).toBeObservable(expected$);
  })
);

test(
  'persistentReducedStream reduces namespaced actions when no namespace is set',
  marbles((m) => {
    const action$ = m.hot('  --1mn-', actions);
    const expected$ = m.hot('1-234-', numbers);
    const initialState = 1;

    const state$ = persistentReducedStream(
      nextStreamName(),
      initialState,
      reducerArray,
      {
        action$,
      }
    );
    state$.connect();

    m.expect(from(state$)).toBeObservable(expected$);
  })
);

test(
  'persistentReducedStream forwards namespace to reducers',
  marbles((m) => {
    const action$ = m.hot('  --n-', actions);
    const expected$ = m.hot('1-2-', numbers);
    const initialState = 1;

    const verifyNamespaceReducer = reducer(
      actionCreators.incrementOne,
      (state, _, namespace) => {
        if (namespace === incrementMocks.namespace) {
          return 2;
        }
        return state;
      }
    );

    const state$ = persistentReducedStream(
      nextStreamName(),
      initialState,
      [verifyNamespaceReducer],
      { namespace: incrementMocks.namespace, action$ }
    );
    state$.connect();

    m.expect(from(state$)).toBeObservable(expected$);
  })
);
