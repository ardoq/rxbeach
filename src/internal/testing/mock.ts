import { actionCreator } from '../../actionCreator';
import { reducer } from '../../reducer';
import { _namespaceAction } from '../../namespace';

const incrementOne = actionCreator('[increment] one');
const incrementMany = actionCreator<number>('[increment] many');
const decrement = actionCreator('[increment] decrement');

const incrementOneHandler = jest.fn((accumulator: number) => accumulator + 1);
const throwErrorFn = (): number => {
  throw ERROR;
};

const ERROR = 'error';
const namespace = 'namespace';

const handleOne = reducer(incrementOne, incrementOneHandler);
const handleMany = reducer(
  incrementMany,
  (accumulator: number, increment) => accumulator + increment
);
const handleDecrementWithError = reducer(decrement, throwErrorFn);

export const incrementMocks = {
  error: ERROR,
  namespace,
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
      n: _namespaceAction(namespace, incrementOne()),
      m: _namespaceAction('memespace', incrementOne()),
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
