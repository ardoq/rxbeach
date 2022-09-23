import test from 'ava';
import { reducedStream } from './reducedStream';
import { Subject, from, map, of } from 'rxjs';
import { marbles } from 'rxjs-marbles/ava';
import { incrementMocks } from './internal/testing/mock';
import { reducer } from './reducer';

const { reducers, actionCreators, handlers } = incrementMocks;
const { actions, numbers, errors } = incrementMocks.marbles;
const reducerArray = Object.values(reducers);

let counter = 1;
const nextStreamName = () => `testStream-${counter++}`;

test('reducedStream should expose initial state immediately after subscribtion', (t) => {
  const state = 'hello';
  const state$ = reducedStream(nextStreamName(), state, []);
  state$.subscribe((emittedState) => {
    t.is(emittedState, state);
  });
  t.plan(1);
});

test(
  'reducedStream reduces state',
  marbles((m) => {
    const action$ = m.hot('  --1-2', actions);
    const expected$ = m.hot('1-2-4', numbers);
    const initialState = 1;

    const state$ = reducedStream(nextStreamName(), initialState, reducerArray, {
      action$,
    });

    m.expect(state$).toBeObservable(expected$);
  })
);

test(
  'reducedStream should support piping',
  marbles((m) => {
    const action$ = m.hot('-1-1-2', actions);
    const expected = '     02-4-8';

    const state$ = reducedStream(nextStreamName(), 0, reducerArray, {
      action$,
    });
    const actual$ = state$.pipe(map((a) => `${a * 2}`));

    m.expect(actual$).toBeObservable(expected);
  })
);

test('reducedStream should call reducer once when there are multiple subs', (t) => {
  const initialState = 1;
  handlers.incrementOne.resetHistory();
  const action$ = of(actionCreators.incrementOne());
  const state$ = reducedStream(nextStreamName(), initialState, reducerArray, {
    action$,
  });

  const sub1 = state$.subscribe();
  const sub2 = state$.subscribe();
  t.assert(handlers.incrementOne.calledOnce);
  sub1.unsubscribe();
  sub2.unsubscribe();
});

test(
  'reducedStream do not reduce when it has no subscribers',
  marbles((m, t) => {
    const initialState = 5;
    const action$ = m.hot('-1-2-1-', actions);
    reducedStream(
      nextStreamName(),
      initialState,
      [
        reducer(actionCreators.incrementOne, (previous) => {
          t.fail();
          return previous + 1;
        }),
      ],
      {
        action$,
      }
    );
    t.plan(0);
  })
);

test(
  'reducedStream catches errors and emits them to error subject without losing subscription',
  marbles((m) => {
    const action$ = m.hot('  -d-1-d-2', actions);
    const expected$ = m.hot('1--2---4', numbers);
    const errorMarbles = '   -e---e--';
    const error$ = new Subject<any>();

    const state$ = reducedStream(nextStreamName(), 1, reducerArray, {
      errorSubject: error$,
      action$,
    });
    m.expect(error$).toBeObservable(errorMarbles, errors);
    m.expect(state$).toBeObservable(expected$);
  })
);

test(
  'reducedStream only reduces action with correct namespace',
  marbles((m) => {
    const action$ = m.hot('  --mnnm-', actions);
    const expected$ = m.hot('1--23--', numbers);
    const initialState = 1;

    const state$ = reducedStream(nextStreamName(), initialState, reducerArray, {
      namespace: incrementMocks.namespace,
      action$,
    });

    m.expect(from(state$)).toBeObservable(expected$);
  })
);

test(
  'reducedStream reduces namespaced actions when no namespace is set',
  marbles((m) => {
    const action$ = m.hot('  --1mn-', actions);
    const expected$ = m.hot('1-234-', numbers);
    const initialState = 1;

    const state$ = reducedStream(nextStreamName(), initialState, reducerArray, {
      action$,
    });

    m.expect(from(state$)).toBeObservable(expected$);
  })
);

test(
  'reducedStream forwards namespace to reducers',
  marbles((m) => {
    const action$ = m.hot('  --nm-2-n', actions);
    const expected$ = m.hot('1-2----2', numbers);
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

    const state$ = reducedStream(
      nextStreamName(),
      initialState,
      [verifyNamespaceReducer],
      { namespace: incrementMocks.namespace, action$ }
    );
    state$.subscribe();

    m.expect(from(state$)).toBeObservable(expected$);
  })
);
