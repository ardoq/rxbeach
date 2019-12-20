import { Observable, OperatorFunction } from 'rxjs';
import { withLatestFrom } from 'rxjs/operators';
import {
  markWithLatest,
  markName,
  CombinationOperator,
} from 'rxbeach/internal';

/**
 * Get data from other streams
 *
 * This is basically an annotated version of the `withLatestFrom` operator that
 * adds markers so the stream can be analyzed.
 *
 * @param name The unique name of this stream
 * @param dependencies$ The dependencies of this stream
 * @see withLatestFrom
 */
export const withStreams: CombinationOperator = (
  name: string,
  ...dependencies$: Observable<unknown>[]
): OperatorFunction<any, any> => observable$ =>
  observable$.pipe(
    withLatestFrom(...dependencies$),
    markWithLatest(observable$, dependencies$),
    markName(name)
  );
