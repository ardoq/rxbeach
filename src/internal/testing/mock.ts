import { actionCreator } from 'rxbeach/actionCreator';
import { reducer } from 'rxbeach/reducer';
import sinon from 'sinon';

const incrementOne = actionCreator('[increment] one');
const incrementMany = actionCreator<number>('[increment] many');
const decrement = actionCreator('[increment] decrement');

const incrementOneHandler = sinon.spy((accumulator: number) => accumulator + 1);
const throwErrorFn = (): number => {
  throw ERROR;
};

const ERROR = 'error';

const handleOne = reducer(incrementOne, incrementOneHandler);
const handleMany = reducer(
  incrementMany,
  (accumulator: number, increment) => accumulator + increment
);
const handleDecrementWithError = reducer(decrement, throwErrorFn);

export const incrementMocks = {
  error: ERROR,
  actionCreators: {
    incrementOne,
    incrementMany,
    decrement,
  },
  handlers: {
    incrementOne: incrementOneHandler,
  },
  reducers: { handleOne, handleMany, handleDecrementWithError },
  marbles: {
    errors: {
      e: ERROR,
    },
    actions: {
      '1': incrementOne(),
      '2': incrementMany(2),
      d: decrement(),
    },
    words: {
      a: '1',
      b: '12',
    },
    numbers: {
      '1': 1,
      '2': 2,
      '3': 3,
      '4': 4,
      '5': 5,
      '6': 6,
      '7': 7,
    },
  },
};
