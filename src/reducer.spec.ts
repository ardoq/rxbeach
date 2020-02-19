import { reducer, combineReducers, actionCreator } from 'rxbeach';
import test from 'ava';
import { marbles } from 'rxjs-marbles/ava';
import sinon from 'sinon';

const throwErrorFn = (): number => {
  throw 'error';
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
const handleDecrement = reducer(decrement, throwErrorFn);
const alwaysReset = reducer([incrementOne, incrementMany, decrement], () => 5);

const inputs = {
  '1': incrementOne(),
  '2': incrementMany(2),
  d: decrement(),
};
const outputs = {
  '2': 2,
  '4': 4,
  '5': 5,
};

test('reducer should store reducer function', t => {
  incrementOneHandler.resetHistory();
  handleOne(1);
  t.assert(incrementOneHandler.called);
});

test(
  'combineReducers should reduce actions to state',
  marbles(m => {
    const source = m.hot('  121', inputs);
    const expected = m.hot('245', outputs);

    m.expect(
      source.pipe(combineReducers(1, [handleOne, handleMany]))
    ).toBeObservable(expected);
  })
);

test(
  'combineReducers should not silence errors',
  marbles(m => {
    const source = m.hot('  1d1', inputs);
    const expected = m.hot('2# ', outputs);

    m.expect(
      source.pipe(combineReducers(1, [handleOne, handleDecrement]))
    ).toBeObservable(expected);
  })
);

test(
  'combineReducers should handle reducers for multiple actions',
  marbles(m => {
    const source = m.hot('  1', inputs);
    const expected = m.hot('5', outputs);

    m.expect(source.pipe(combineReducers(1, [alwaysReset]))).toBeObservable(
      expected
    );
  })
);
