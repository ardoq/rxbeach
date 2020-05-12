import test from 'ava';
import { persistentReducedStream } from './persistentReducedStream';
import { of, Subject } from 'rxjs';
import { marbles } from 'rxjs-marbles/ava';
import { incrementMocks } from './internal/testing/mock';
import { map } from 'rxjs/operators';

const { reducers, actionCreators, handlers } = incrementMocks;
const { actions, numbers, errors } = incrementMocks.marbles;
const reducerArray = Object.values(reducers);

test('persistentReducedStream should expose its state immediately', (t) => {
  const state = 'hello';
  const state$ = persistentReducedStream('testStream', state, []);

  t.deepEqual(state$.state, state);
});

test('persistentReducedStream should not initially be closed', (t) => {
  const state$ = persistentReducedStream('testStream', null, []);

  t.false(state$.closed);
});

test(
  'persistentReducedStream reduces state',
  marbles((m, t) => {
    const action$ = m.hot('  --1-', actions);
    const expected$ = m.hot('1-2-', numbers);
    const initialState = 1;

    const state$ = persistentReducedStream(
      'testStream',
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

    const state$ = persistentReducedStream('testStream', 0, reducerArray);
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
    'testStream',
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

    const state$ = persistentReducedStream('testStream', 0, reducerArray);
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
      'testStream',
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

    const state$ = persistentReducedStream('testStream', 1, reducerArray);
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

    const state$ = persistentReducedStream('testStream', 1, reducerArray);
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

test(
  'persistentReducedStream should not emit when it starts reducing',
  marbles((m) => {
    const trigger = m.hot('  -|--');
    const action$ = m.hot('  1--1', actions);
    const expected$ = m.hot('1--2', numbers);
    const subscription = '   -^---';

    const state$ = persistentReducedStream('testStream', 1, reducerArray);
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
    const state$ = persistentReducedStream('testStream', state, []);
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

    const state$ = persistentReducedStream(
      'testStream',
      1,
      reducerArray,
      error$
    );
    m.expect(error$).toBeObservable(errorMarbles, errors);
    m.expect(state$).toBeObservable(expected$);
    state$.startReducing(action$);
  })
);
