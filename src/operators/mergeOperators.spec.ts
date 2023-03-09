import { map } from 'rxjs/operators';
import { marbles } from 'rxjs-marbles/jest';
import { coldMergeOperators, mergeOperators } from './mergeOperators';

const double = map<number, number>((n) => n * 2);
const halve = map<number, number>((n) => n / 2);

const numbers = { 1: 1, 2: 2, 4: 4, 8: 8 };
const source = '  2---4';
const expected = '(41)(82)';
const sub = '     ^';

test(
  'coldMergeOperators should emit from all and subscribe for all operators',
  marbles((m) => {
    const source$ = m.cold(source, numbers);
    const actual = source$.pipe(coldMergeOperators(double, halve));
    m.expect(actual).toBeObservable(expected, numbers);
    m.expect(source$).toHaveSubscriptions([sub, sub]);
  })
);
test(
  'mergeOperators should emit from all operators, but only subscribe source once',
  marbles((m) => {
    const source$ = m.cold(source, numbers);
    const actual = source$.pipe(mergeOperators(double, halve));
    m.expect(actual).toBeObservable(expected, numbers);
    m.expect(source$).toHaveSubscriptions([sub]);
  })
);
