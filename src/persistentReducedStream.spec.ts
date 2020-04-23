import test from 'ava';
import {
  StateStream,
  persistentReducedStream,
} from './persistentReducedStream';
import { never, of, Subject } from 'rxjs';
import { marbles } from 'rxjs-marbles/ava';
import { incrementMocks } from './internal/testing/mock';
import { map } from 'rxjs/operators';

const { reducers, actionCreators, handlers } = incrementMocks;
const { actions, numbers, errors } = incrementMocks.marbles;
const reducerArray = Object.values(reducers);

test('StateStream should expose its state immediately', (t) => {
  const state = 'hello';
  const state$ = new StateStream(state, never());

  t.deepEqual(state$.state, state);
});

test('StateStream should not initially be closed', (t) => {
  const state$ = new StateStream(null, never());

  t.false(state$.closed);
});

test(
  'StateStream should follow the underlying observable',
  marbles((m, t) => {
    const source$ = m.hot('-abc');
    const expected = '     0abc';

    const state$ = new StateStream('0', source$);

    m.expect(state$).toBeObservable(expected);

    m.flush();
    t.deepEqual(state$.state, 'c');
  })
);

test(
  'StateStream should error when the underlying observable errors',
  marbles((m) => {
    const source$ = m.hot('-a#');
    const expected = '     0a#';

    const state$ = new StateStream('0', source$);

    m.expect(state$).toBeObservable(expected);
  })
);

test(
  'StateStream should complete when the underlying observable completes',
  marbles((m) => {
    const source$ = m.hot('-a|');
    const expected = '     0a|';

    const state$ = new StateStream('0', source$);

    m.expect(state$).toBeObservable(expected);
  })
);

test(
  'StateStream should support piping',
  marbles((m) => {
    const source$ = m.hot('-12');
    const expected = '     024';

    const state$ = new StateStream(0, source$);
    const actual$ = state$.pipe(map((a) => `${a * 2}`));

    m.expect(actual$).toBeObservable(expected);
  })
);

test(
  'StateStream should be possible to unsubscribe',
  marbles((m, t) => {
    const trigger = m.hot('--|');
    const source$ = m.hot('-a-c');
    const expected$ = '    0a--';
    const subscription = ' ^-!';

    const state$ = new StateStream('0', source$);
    trigger.subscribe({ complete: () => state$.unsubscribe() });

    m.expect(state$).toBeObservable(expected$);
    m.expect(source$).toHaveSubscriptions(subscription);

    m.flush();
    t.true(state$.closed);
  })
);

test('persistentReducedStream should expose the state immediately', (t) => {
  const initialState = 5;
  const state$ = persistentReducedStream('test', initialState, [], never());

  t.deepEqual(state$.state, initialState);
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
      reducerArray,
      action$
    );

    m.expect(state$).toBeObservable(expected$);

    m.flush();
    t.deepEqual(state$.state, numbers[2]);
  })
);

test('persistentReducedStream should call reducer once when there are multiple subs', (t) => {
  const initialState = 1;
  handlers.incrementOne.resetHistory();
  const action$ = of(actionCreators.incrementOne());
  const state$ = persistentReducedStream(
    'testStream',
    initialState,
    reducerArray,
    action$
  );

  const sub1 = state$.subscribe();
  const sub2 = state$.subscribe();
  t.assert(handlers.incrementOne.calledOnce);
  sub1.unsubscribe();
  sub2.unsubscribe();
});

test(
  'persistentReducedStream should never reset state',
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
      reducerArray,
      action$
    );

    m.expect(state$, sub1).toBeObservable(sub1Expected$);
    m.expect(state$, sub2).toBeObservable(sub2Expected$);
  })
);

test('persistentReducedStream should always reduce', (t) => {
  const initialState = 1;
  const action$ = of(actions[1]);

  const state$ = persistentReducedStream(
    'testStream',
    initialState,
    reducerArray,
    action$
  );

  t.deepEqual(state$.state, 2);
});

test(
  'persistentReducedStream catches errors and emits them to error subject',
  marbles((m) => {
    const action$ = m.hot('  -d-1', actions);
    const expected$ = m.hot('1--2', numbers);
    const errorMarbles = '   -e-';
    const error$ = new Subject<any>();

    m.expect(error$).toBeObservable(errorMarbles, errors);
    m.expect(
      persistentReducedStream('testStream', 1, reducerArray, action$, error$)
    ).toBeObservable(expected$);
  })
);
