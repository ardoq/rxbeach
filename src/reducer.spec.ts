import { reducer, combineReducers } from './reducer';
import test from 'ava';
import { marbles } from 'rxjs-marbles/ava';
import { Subject } from 'rxjs';
import { incrementMocks } from './internal/testing/mock';

const { reducers, actionCreators, handlers } = incrementMocks;
const { actions, words, numbers, errors } = incrementMocks.marbles;
const reducerArray = Object.values(reducers);
const alwaysReset = reducer(
  [
    actionCreators.incrementOne,
    actionCreators.incrementMany,
    actionCreators.decrement,
  ],
  () => 5
);

test('reducer should store reducer function', t => {
  handlers.incrementOne.resetHistory();
  reducers.handleOne(1);
  t.assert(handlers.incrementOne.called);
});

test(
  'combineReducers should reduce actions to state',
  marbles(m => {
    const action$ = m.hot('  121', actions);
    const expected$ = m.hot('245', numbers);

    m.expect(action$.pipe(combineReducers(1, reducerArray))).toBeObservable(
      expected$
    );
  })
);

test(
  'combineReducers should reduce state from other streams',
  marbles(m => {
    const action$ = m.hot('  --');
    const word$ = m.hot('    ab', words);
    const expected$ = m.hot('24', numbers);

    const handleWord = reducer(
      word$,
      (state: number, word) => state + word.length
    );

    m.expect(action$.pipe(combineReducers(1, [handleWord]))).toBeObservable(
      expected$
    );
  })
);

test(
  'combineReducers should support both actions and other streams',
  marbles(m => {
    const action$ = m.hot('  -1-', actions);
    const word$ = m.hot('    a-b', words);
    const expected$ = m.hot('235', numbers);

    const handleWord = reducer(
      word$,
      (state: number, word) => state + word.length
    );

    m.expect(
      action$.pipe(combineReducers(1, [...reducerArray, handleWord]))
    ).toBeObservable(expected$);
  })
);

test(
  'combineReducers catches errors and emits them to error subject',
  marbles(m => {
    const action$ = m.hot('  1d1', actions);
    const expected$ = m.hot('2-3', numbers);
    const errorMarbles = '   -e-';
    const error$ = new Subject<any>();

    m.expect(error$).toBeObservable(errorMarbles, errors);
    m.expect(
      action$.pipe(combineReducers(1, reducerArray, error$))
    ).toBeObservable(expected$);
  })
);

test(
  'combineReducers should handle reducers for multiple actions',
  marbles(m => {
    const action$ = m.hot('  12', actions);
    const expected$ = m.hot('55', numbers);

    m.expect(action$.pipe(combineReducers(1, [alwaysReset]))).toBeObservable(
      expected$
    );
  })
);

test(
  'combineReducers should reduce in predictable order',
  marbles(m => {
    // The "predictable order" seems to be the order in which the streams emit.
    // Eg. The ordering of these seed definitions matter, but not the order of
    //     the reducers.
    const action$ = m.hot('   1', actions);
    const reset$ = m.hot('    6', numbers);
    const divide$ = m.hot('   2', numbers);
    const expected$ = m.hot('(263)', numbers);

    const resetReducer = reducer(reset$, (_: number, state) => state);
    const divideReducer = reducer(
      divide$,
      (state: number, divisor) => state / divisor
    );

    m.expect(
      action$.pipe(
        combineReducers(1, [divideReducer, resetReducer, ...reducerArray])
      )
    ).toBeObservable(expected$);
  })
);
