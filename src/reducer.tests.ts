import { of } from 'rxjs';
import { deepEqual, equal, AssertionError } from 'assert';
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
    it('Should not silence errors', async function() {
      const fail = actionCreator('[test] throws action');
      const succeed = actionCreator('[test] set state');
      const handleFailure = reducer<boolean>(fail, throwErrorFn);
      const handleSuccess = reducer(succeed, () => true);

      let silenced = false;
      try {
        await of(fail(), succeed())
          .pipe(combineReducers(false, handleFailure, handleSuccess))
          .toPromise();
        silenced = true;
      } catch (err) {
        silenced = false;
      }

      if (silenced) {
        throw new AssertionError({
          message: 'combineReducers should not silence errors',
        });
      }
    });
  });
});
