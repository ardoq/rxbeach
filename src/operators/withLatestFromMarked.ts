import { Observable, OperatorFunction } from 'rxjs';
import { withLatestFrom } from 'rxjs/operators';
import { markWithLatest } from 'rxbeach/internal';

export type WithLatestFromMarked = {
  <T, A>(a: Observable<A>): OperatorFunction<T, [T, A]>;
  <T, A, B>(a: Observable<A>, b: Observable<B>): OperatorFunction<T, [T, A, B]>;
  <T, A, B, C>(
    a: Observable<A>,
    b: Observable<B>,
    c: Observable<C>
  ): OperatorFunction<T, [T, A, B, C]>;
  <T, A, B, C, D>(
    a: Observable<A>,
    b: Observable<B>,
    c: Observable<C>,
    d: Observable<D>
  ): OperatorFunction<T, [T, A, B, C, D]>;
  <T, A, B, C, D, E>(
    a: Observable<A>,
    b: Observable<B>,
    c: Observable<C>,
    d: Observable<D>,
    e: Observable<E>
  ): OperatorFunction<T, [T, A, B, C, D, E]>;
  <T, A, B, C, D, E, F>(
    a: Observable<A>,
    b: Observable<B>,
    c: Observable<C>,
    d: Observable<D>,
    e: Observable<E>,
    f: Observable<F>
  ): OperatorFunction<T, [T, A, B, C, D, E, F]>;
  <T, A, B, C, D, E, F, G>(
    a: Observable<A>,
    b: Observable<B>,
    c: Observable<C>,
    d: Observable<D>,
    e: Observable<E>,
    f: Observable<F>,
    g: Observable<G>
  ): OperatorFunction<T, [T, A, B, C, D, E, F, G]>;
  <T>(...dependencies: Observable<unknown>[]): OperatorFunction<T, unknown>;
};

/**
 * withLatestFrom that also adds a marker for stream analysis.
 *
 * @param dependencies$ The dependencies of this stream
 * @see withLatestFrom
 */
export const withLatestFromMarked: WithLatestFromMarked = (
  ...dependencies$: Observable<unknown>[]
): OperatorFunction<any, any> => observable$ =>
  observable$.pipe(
    withLatestFrom(...dependencies$),
    markWithLatest(observable$, dependencies$)
  );
