import { reducer } from 'rxbeach';
import untypedTest from 'ava';
import { marbles } from 'rxjs-marbles/ava';
import { reduceState } from 'rxbeach/reduceState';
import { of, Subject } from 'rxjs';
import { stubRethrowErrorGlobally } from 'rxbeach/internal/testing/utils';
import { incrementMocks } from 'rxbeach/internal/testing/mock';

const { reducers, actionCreators, handlers } = incrementMocks;
const { actions, words, numbers, errors } = incrementMocks.marbles;
const reducerArray = Object.values(reducers);
const test = stubRethrowErrorGlobally(untypedTest);

test(
  'reduceState should subscribe to action$ and emit initial state synchronously upon subscription',
  marbles(m => {
    const defaultState = 3;
    const action$ = m.hot('  -');
    const sub = '            ^';
    const expected$ = m.hot('3', numbers);
    const state$ = action$.pipe(reduceState('testStream', defaultState, []));

    m.expect(state$, sub).toBeObservable(expected$);
    m.expect(action$).toHaveSubscriptions([sub]);
  })
);

test(
  'reduceState should only emit the latest state processed at the current frame',
  marbles(m => {
    const action$ = m.hot('  --1-', actions);
    const word$ = m.hot('    a-a ', words);
    const expected$ = m.hot('2-4', numbers);
    const defaultState = 1;

    const handleWord = reducer(
      word$,
      (state: number, word) => state + word.length
    );
    const state$ = action$.pipe(
      reduceState('testStream', defaultState, [...reducerArray, handleWord])
    );

    m.expect(state$).toBeObservable(expected$);
  })
);

test('reduceState should call reducer once when there are multiple subs', t => {
  const defaultState = 1;
  handlers.incrementOne.resetHistory();
  const action$ = of(actionCreators.incrementOne());
  const state$ = action$.pipe(
    reduceState('testStream', defaultState, reducerArray)
  );
  const sub1 = state$.subscribe();
  const sub2 = state$.subscribe();
  t.assert(handlers.incrementOne.calledOnce);
  sub1.unsubscribe();
  sub2.unsubscribe();
});

test(
  'reduceState should share state and not reset as long as it has one subscriber',
  marbles(m => {
    const defaultState = 1;
    const action$ = m.hot('      ----1-----1-', actions);
    const sub1 = '               ^-----------';
    const sub1Expected$ = m.hot('1---2-----3-', numbers);
    const sub2 = '               --^--!------';
    const sub2Expected$ = m.hot('--1-2-------', numbers);
    const sub3 = '               ---------^-!';
    const sub3Expected$ = m.hot('---------23-', numbers);
    const state$ = action$.pipe(
      reduceState('testStream', defaultState, reducerArray)
    );

    m.expect(state$, sub1).toBeObservable(sub1Expected$);
    m.expect(state$, sub2).toBeObservable(sub2Expected$);
    m.expect(state$, sub3).toBeObservable(sub3Expected$);
  })
);

test(
  'reduceState should reset state when it has no subscribers',
  marbles(m => {
    const defaultState = 1;
    const action$ = m.hot('      1--1---1---1-', actions);
    const sub1 = '               --^--!--------';
    const sub1Expected$ = m.hot('--12----------', numbers);
    const sub2 = '               ---------^---!';
    const sub2Expected$ = m.hot('---------1-2-', numbers);
    const state$ = action$.pipe(
      reduceState('testStream', defaultState, reducerArray)
    );

    m.expect(state$, sub1).toBeObservable(sub1Expected$);
    m.expect(state$, sub2).toBeObservable(sub2Expected$);
  })
);

test(
  'reduceState catches errors and emits them to error subject',
  marbles(m => {
    const action$ = m.hot('  1d1', actions);
    const expected$ = m.hot('2-3', numbers);
    const errorMarbles = '   -e-';
    const error$ = new Subject<any>();

    m.expect(error$).toBeObservable(errorMarbles, errors);
    m.expect(
      action$.pipe(reduceState('testStream', 1, reducerArray, error$))
    ).toBeObservable(expected$);
  })
);
