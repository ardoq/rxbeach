import { OperatorFunction, merge, pipe } from 'rxjs';
import { share } from 'rxjs/operators';

/**
 * Runs operators in parallel and merges their results
 *
 * For each operator, the returned observable is subscribed to a pipe from the
 * source observable with the operator. This makes it a bit like the `flatMap`
 * operator and the `merge` function, but on an operator level instead of value
 * or observable level.
 *
 * NB: Each operator will create a "copy" of the stream, so any operators
 *     before the `coldMergeOperators` operator, will be executed for each
 *     operator passed to `coldMergeOperators`. Because of this, you might want
 *     to use the `mergeOperators` operator, which includes a `share` operator
 *     to make the upstream hot.
 *
 * @param operators Operators to run in parallell and merge the results of
 */
export const coldMergeOperators = <T, R>(
  ...operators: OperatorFunction<T, R>[]
): OperatorFunction<T, R> => source =>
  merge(...operators.map(operator => source.pipe(operator)));

/**
 * Runs operators in parallel and merges their results
 *
 * For each operator, the returned observable is subscribed to a pipe from the
 * source observable with the operator. This makes it a bit like the `flatMap`
 * operator and the merge function, but on an operator level instead of value
 * or observable level.
 *
 * This operator includes the `share` operator on the parent stream, to prevent
 * operators that are attached before this one from running multiple times.
 *
 * @param operators Operators to run in parallell and merge the results of
 */
export const mergeOperators = <T, R>(
  ...operators: OperatorFunction<T, R>[]
): OperatorFunction<T, R> =>
  pipe(
    share(),
    coldMergeOperators(...operators)
  );
