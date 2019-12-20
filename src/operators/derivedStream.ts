import { Observable, OperatorFunction } from 'rxjs';
import { combineLatest } from 'rxjs/operators';
import { markCombine, markName, CombinationOperator } from 'rxbeach/internal';

/**
 * Make this stream a derived stream of its source and dependencies
 *
 * This is basically an annotated version of the `combineLatest` operator that
 * adds markers so the stream can be analyzed.
 *
 * @param name The unique name of this stream
 * @param dependencies The dependencies of this stream
 * @see combineLatest
 */
export const derivedStream: CombinationOperator = (
  name: string,
  ...dependencies: Observable<unknown>[]
): OperatorFunction<any, any> => observable$ =>
  observable$.pipe(
    combineLatest(...dependencies),
    markCombine([observable$, ...dependencies]),
    markName(name)
  );
