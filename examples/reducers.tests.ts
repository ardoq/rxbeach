import { actionCreator, reducer, combineReducers } from 'rxbeach';
import { Reducer } from 'rxbeach/reducer';
import { marbles } from 'rxjs-marbles/mocha';

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

    const inputs = {
      '1': incrementOne(),
      '3': incrementMany(3),
      '5': incrementMany(5),
    };
    const outputs = {
      '3': 3,
      '4': 4,
      '9': 9,
    };

    it(
      'handles actions',
      marbles(m => {
        const source = m.hot('  315', inputs);
        const expected = m.hot('349', outputs);

        m.expect(source.pipe(reducers)).toBeObservable(expected);
      })
    );
  });
});
