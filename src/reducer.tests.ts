import { deepEqual } from 'assert';
import { reducer, combineReducers } from 'rxbeach';
import { actionCreator } from './actionCreator';
import { marbles } from 'rxjs-marbles/mocha';

const throwErrorFn = (): number => {
  throw 'error';
};

describe('reducers', function() {
  describe('reducer', function() {
    it('Should store reducer function', function() {
      const addString = actionCreator<string>('add string');
      const reducerFn = (totalLength: number, payload: string) =>
        totalLength + payload.length;

      const addStringReducer = reducer(addString, reducerFn);

      deepEqual(addStringReducer, [addString.type, reducerFn]);
    });
  });

  describe('combineReducers', function() {
    const incrementOne = actionCreator('[increment] one');
    const incrementMany = actionCreator<number>('[increment] many');
    const decrement = actionCreator('[increment] decrement');
    const handleOne = reducer(
      incrementOne,
      (accumulator: number) => accumulator + 1
    );
    const handleMany = reducer(
      incrementMany,
      (accumulator: number, increment) => accumulator + increment
    );
    const handleDecrement = reducer(decrement, throwErrorFn);

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

    it(
      'Should reduce actions to state',
      marbles(m => {
        const source = m.hot('121', inputs);
        const expected = m.hot('245', outputs);

        m.expect(
          source.pipe(combineReducers(1, [handleOne, handleMany]))
        ).toBeObservable(expected);
      })
    );

    it(
      'Should not silence errors',
      marbles(m => {
        const source = m.hot('  1d1', inputs);
        const expected = m.hot('2# ', outputs);

        m.expect(
          source.pipe(combineReducers(1, [handleOne, handleDecrement]))
        ).toBeObservable(expected);
      })
    );
  });
});
