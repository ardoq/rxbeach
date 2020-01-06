import { actionCreator, reducer, combineReducers, ReducerEntry } from 'rxbeach';
import test from 'ava';
import { marbles } from 'rxjs-marbles/ava';

// Some actions
const incrementOne = actionCreator('[increment] one');
const incrementMany = actionCreator<number>('[increment] many');

// Our reducers
type CounterState = number;
type CounterReducer = ReducerEntry<CounterState>;

// Style 1 - Define the state type on state argument
const handleOne = reducer(incrementOne, (prev: CounterState) => prev + 1);
// Notice type for second parameter is inferred from payload type
const handleMany = reducer(
  incrementMany,
  (prev: CounterState, inc) => prev + inc
);

// Style 2 - Set a field type, so the state type is inferred
//           Sadly, this means the field is set with any as the payload type
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const handleMany2: CounterReducer = reducer(
  incrementMany,
  (prev, inc) => prev + inc
);

const reduce = combineReducers(0, [handleOne, handleMany]);

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

test(
  'reduce handle actions',
  marbles(m => {
    const source = m.hot('  315', inputs);
    const expected = m.hot('349', outputs);

    m.expect(source.pipe(reduce)).toBeObservable(expected);
  })
);
