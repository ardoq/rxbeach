import { reducer, combineReducers, actionCreator } from 'rxbeach';
import test from 'ava';
import { marbles } from 'rxjs-marbles/ava';
import sinon from 'sinon';
import { Subject } from 'rxjs';

const throwErrorFn = (): number => {
  throw errors.e;
};
const incrementOne = actionCreator('[increment] one');
const decrement = actionCreator('[increment] decrement');
const incrementMany = actionCreator<number>('[increment] many');

const incrementOneHandler = sinon.spy((accumulator: number) => accumulator + 1);
const handleOne = reducer(incrementOne, incrementOneHandler);
const handleMany = reducer(
  incrementMany,
  (accumulator: number, increment) => accumulator + increment
);
const handleDecrementWithError = reducer(decrement, throwErrorFn);
const alwaysReset = reducer([incrementOne, incrementMany, decrement], () => 5);

const actions = {
  '1': incrementOne(),
  '2': incrementMany(2),
  d: decrement(),
};
const words = {
  a: '1',
  b: '12',
};
const numbers = {
  '1': 1,
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
};
const errors = {
  e: 'error',
};

test('reducer should store reducer function', t => {
  incrementOneHandler.resetHistory();
  handleOne(1);
  t.assert(incrementOneHandler.called);
});

test(
  'combineReducers should reduce actions to state',
  marbles(m => {
    const action$ = m.hot('  121', actions);
    const expected$ = m.hot('245', numbers);

    m.expect(
      action$.pipe(combineReducers(1, [handleOne, handleMany]))
    ).toBeObservable(expected$);
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
      action$.pipe(combineReducers(1, [handleOne, handleWord]))
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
      action$.pipe(
        combineReducers(1, [handleOne, handleDecrementWithError], error$)
      )
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
      action$.pipe(combineReducers(1, [divideReducer, resetReducer, handleOne]))
    ).toBeObservable(expected$);
  })
);
