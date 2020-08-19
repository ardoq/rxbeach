import test, { Macro } from 'ava';
import { persistentReducedStream } from './persistentReducedStream';
import { of, Subject, empty } from 'rxjs';
import { marbles } from 'rxjs-marbles/ava';
import { incrementMocks } from './internal/testing/mock';
import { map } from 'rxjs/operators';
import { reducer } from './reducer';

const { reducers, actionCreators, handlers } = incrementMocks;
const { actions, numbers, errors } = incrementMocks.marbles;
const reducerArray = Object.values(reducers);

let counter = 1;
const nextStreamName = () => `testStream-${counter++}`;

test('persistentReducedStream should expose its state immediately', (t) => {
  const state = 'hello';
  const state$ = persistentReducedStream(nextStreamName(), state, []);

  t.deepEqual(state$.state, state);
});

test('persistentReducedStream should not initially be closed', (t) => {
  const state$ = persistentReducedStream(nextStreamName(), null, []);

  t.false(state$.closed);
});

test(
  'persistentReducedStream reduces state',
  marbles((m, t) => {
    const action$ = m.hot('  --1-', actions);
    const expected$ = m.hot('1-2-', numbers);
    const initialState = 1;

    const state$ = persistentReducedStream(
      nextStreamName(),
      initialState,
      reducerArray
    );
    state$.startReducing(action$);

    m.expect(state$).toBeObservable(expected$);

    m.flush();
    t.deepEqual(state$.state, numbers[2]);
  })
);

test(
  'persistentReducedStream should support piping',
  marbles((m) => {
    const action$ = m.hot('-1-1', actions);
    const expected = '     02-4';

    const state$ = persistentReducedStream(nextStreamName(), 0, reducerArray);
    state$.startReducing(action$);
    const actual$ = state$.pipe(map((a) => `${a * 2}`));

    m.expect(actual$).toBeObservable(expected);
  })
);

test('persistentReducedStream should call reducer once when there are multiple subs', (t) => {
  const initialState = 1;
  handlers.incrementOne.resetHistory();
  const action$ = of(actionCreators.incrementOne());
  const state$ = persistentReducedStream(
    nextStreamName(),
    initialState,
    reducerArray
  );

  state$.startReducing(action$);

  const sub1 = state$.subscribe();
  const sub2 = state$.subscribe();
  t.assert(handlers.incrementOne.calledOnce);
  sub1.unsubscribe();
  sub2.unsubscribe();
});

test(
  'persistentReducedStream should ignore actions, but emit initial state before it starts reducing',
  marbles((m) => {
    const action$ = m.hot('-1-1', actions);
    const expected = '     0---';

    const state$ = persistentReducedStream(nextStreamName(), 0, reducerArray);
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
      reducerArray
    );

    state$.startReducing(action$);

    m.expect(state$, sub1).toBeObservable(sub1Expected$);
    m.expect(state$, sub2).toBeObservable(sub2Expected$);
  })
);

test(
  'persistentReducedStream internal subject should close when reducing is stopped',
  marbles((m, t) => {
    const trigger = m.hot('  --|');
    const action$ = m.hot('  -1-1', actions);
    const expected$ = m.hot('12--', numbers);
    const subscription = ' ^-!';

    const state$ = persistentReducedStream(nextStreamName(), 1, reducerArray);
    state$.startReducing(action$);
    trigger.subscribe({ complete: () => state$.stopReducing() });

    m.expect(state$).toBeObservable(expected$);
    m.expect(action$).toHaveSubscriptions(subscription);

    m.flush();
    t.true(state$.closed);
  })
);

test(
  'persistentReducedStream should allow to restart reducing after stopping',
  marbles((m, t) => {
    const trigger = m.hot('  ---|');
    const action$ = m.hot('  -1--1--', actions);
    const subscription = '   ^-!';
    const expected$ = m.hot('12--', numbers);

    const state$ = persistentReducedStream(nextStreamName(), 1, reducerArray);
    state$.startReducing(action$);
    trigger.subscribe({
      complete: () => {
        const lastState = state$.state;
        state$.stopReducing();
        state$.startReducing(action$, lastState);
      },
    });
    m.expect(state$, subscription).toBeObservable(expected$);
    m.flush();
    t.false(state$.closed);
  })
);

const startWithState: Macro<[any]> = (t, state) => {
  const state$ = persistentReducedStream(nextStreamName(), 1, reducerArray);
  state$.startReducing(empty() as any, state);

  t.deepEqual(state$.state, state);
};
startWithState.title = (state) =>
  `persistentReducedStream should allow starting with specified state ${state}`;

test('number', startWithState, 12);
test('zero', startWithState, 0);
test('false', startWithState, false);
test('null', startWithState, null);

const restartWithState: Macro<[any]> = (t, state) => {
  const state$ = persistentReducedStream(nextStreamName(), 1, reducerArray);
  state$.startReducing(empty() as any);
  state$.stopReducing();
  state$.startReducing(empty() as any, state);

  t.deepEqual(state$.state, state);
};
restartWithState.title = (state) =>
  `persistentReducedStream should allow restarting with specified state ${state}`;

test('number', restartWithState, 12);
test('zero', restartWithState, 0);
test('false', restartWithState, false);
test('null', restartWithState, null);

test(
  'persistentReducedStream should not emit when it starts reducing',
  marbles((m) => {
    const trigger = m.hot('  -|--');
    const action$ = m.hot('  1--1', actions);
    const expected$ = m.hot('1--2', numbers);
    const subscription = '   -^---';

    const state$ = persistentReducedStream(nextStreamName(), 1, reducerArray);
    trigger.subscribe({ complete: () => state$.startReducing(action$) });

    m.expect(state$).toBeObservable(expected$);
    m.expect(action$).toHaveSubscriptions(subscription);
  })
);

test(
  'persistentReducedStream should change state if its started with different state',
  marbles((m, t) => {
    const action$ = m.hot('-1-');
    const state = 'hello';
    const newState = 'world';
    const state$ = persistentReducedStream(nextStreamName(), state, []);
    t.deepEqual(state$.state, state);
    state$.startReducing(action$, newState);
    t.deepEqual(state$.state, newState);
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
    });
    m.expect(error$).toBeObservable(errorMarbles, errors);
    m.expect(state$).toBeObservable(expected$);
    state$.startReducing(action$);
  })
);

test('persistentReducedStream should throw exception when accessing state after stopped reducing', (t) => {
  const state$ = persistentReducedStream(nextStreamName(), 1, reducerArray);
  state$.stopReducing();

  t.throws(() => state$.state);
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
      { namespace: incrementMocks.namespace }
    );
    state$.startReducing(action$);

    m.expect(state$).toBeObservable(expected$);
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
      reducerArray
    );
    state$.startReducing(action$);

    m.expect(state$).toBeObservable(expected$);
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
      { namespace: incrementMocks.namespace }
    );
    state$.startReducing(action$);

    m.expect(state$).toBeObservable(expected$);
  })
);
