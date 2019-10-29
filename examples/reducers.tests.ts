import { actionCreator, reducer, combineReducers } from 'rxbeach';
import { of } from 'rxjs';
import { equal } from 'assert';
import { Reducer } from 'rxbeach/reducer';

describe('example', function() {
  describe('reducers', function() {
    // Some actions
    const incrementOne = actionCreator('[increment] one');
    const incrementMany = actionCreator<number>('[increment] many');

    // Our reducers
    type CounterState = number;
    const handleOne = reducer(incrementOne, (prev: CounterState) => prev + 1);
    const handleMany = reducer(
      incrementMany,
      // Notice type for second parameter is inferred from payload type
      (prev: CounterState, inc) => prev + inc
    );
    // Alternative style
    type CounterReducer = [string, Reducer<CounterState, any>];
    const handleMany2: CounterReducer = reducer(
      incrementMany,
      (prev, inc) => prev + inc
    );

    const reducers = combineReducers(0, [handleOne, handleMany]);

    it('handles incrementOne', async function() {
      const res = await of(incrementOne(), incrementOne())
        .pipe(reducers)
        .toPromise();

      equal(res, 2);
    });

    it('handles incrementMany', async function() {
      const res = await of(incrementMany(12), incrementMany(3))
        .pipe(reducers)
        .toPromise();

      equal(res, 15);
    });

    it('handles mix of incrementOne and incrementMany', async function() {
      const res = await of(incrementMany(3), incrementOne(), incrementMany(4))
        .pipe(reducers)
        .toPromise();

      equal(res, 8);
    });
  });
});
