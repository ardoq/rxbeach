import { of } from 'rxjs';
import { deepEqual, equal } from 'assert';
import { reducer, combineReducers } from 'rxbeach';
import { actionCreator } from './actionCreator';

const throwErrorFn = () => {
  throw new Error();
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
    it('Should reduce actions to state', async function() {
      const incrementOne = actionCreator('[increment] one');
      const incrementMany = actionCreator<number>('[increment] many');
      const handleOne = reducer(
        incrementOne,
        (accumulator: number) => accumulator + 1
      );
      const handleMany = reducer(
        incrementMany,
        (accumulator: number, increment) => accumulator + increment
      );

      const res = await of(incrementOne(), incrementMany(2), incrementOne())
        .pipe(combineReducers(1, handleOne, handleMany))
        .toPromise();

      equal(res, 5);
    });
    it('Should ignore reducers that throw errors', async function() {
      const fail = actionCreator('[test] throws action');
      const succeed = actionCreator('[test] set state');
      const handleFailure = reducer<boolean>(fail, throwErrorFn);
      const handleSuccess = reducer(succeed, () => true);

      const res = await of(fail(), succeed())
        .pipe(combineReducers(false, handleFailure, handleSuccess))
        .toPromise();

      equal(res, true);
    });
  });
});
