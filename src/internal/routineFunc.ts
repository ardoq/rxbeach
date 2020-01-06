import { OperatorFunction } from 'rxjs';
import { Routine } from 'rxbeach/routines';

export interface RoutineFunc {
  /**
   * See collectRoutines for documentation
   */
  <A>(fn1: Routine<A>): Routine<A>;
  /**
   * See collectRoutines for documentation
   */
  <A, B>(fn1: Routine<A>, fn2: OperatorFunction<A, B>): Routine<B>;
  /**
   * See collectRoutines for documentation
   */
  <A, B, C>(
    fn1: Routine<A>,
    fn2: OperatorFunction<A, B>,
    fn3: OperatorFunction<B, C>
  ): Routine<C>;
  /**
   * See collectRoutines for documentation
   */
  <A, B, C, D>(
    fn1: Routine<A>,
    fn2: OperatorFunction<A, B>,
    fn3: OperatorFunction<B, C>,
    fn4: OperatorFunction<C, D>
  ): Routine<D>;
  /**
   * See collectRoutines for documentation
   */
  <A, B, C, D, E>(
    fn1: Routine<A>,
    fn2: OperatorFunction<A, B>,
    fn3: OperatorFunction<B, C>,
    fn4: OperatorFunction<C, D>,
    fn5: OperatorFunction<D, E>
  ): Routine<E>;
  /**
   * See collectRoutines for documentation
   */
  <A, B, C, D, E, F>(
    fn1: Routine<A>,
    fn2: OperatorFunction<A, B>,
    fn3: OperatorFunction<B, C>,
    fn4: OperatorFunction<C, D>,
    fn5: OperatorFunction<D, E>,
    fn6: OperatorFunction<E, F>
  ): Routine<F>;
  /**
   * See collectRoutines for documentation
   */
  <A, B, C, D, E, F, G>(
    fn1: Routine<A>,
    fn2: OperatorFunction<A, B>,
    fn3: OperatorFunction<B, C>,
    fn4: OperatorFunction<C, D>,
    fn5: OperatorFunction<D, E>,
    fn6: OperatorFunction<E, F>,
    fn7: OperatorFunction<F, G>
  ): Routine<G>;
  /**
   * See collectRoutines for documentation
   */
  <A, B, C, D, E, F, G, H>(
    fn1: Routine<A>,
    fn2: OperatorFunction<A, B>,
    fn3: OperatorFunction<B, C>,
    fn4: OperatorFunction<C, D>,
    fn5: OperatorFunction<D, E>,
    fn6: OperatorFunction<E, F>,
    fn7: OperatorFunction<F, G>,
    fn8: OperatorFunction<G, H>
  ): Routine<H>;
  /**
   * See collectRoutines for documentation
   */
  <A, B, C, D, E, F, G, H, I>(
    fn1: Routine<A>,
    fn2: OperatorFunction<A, B>,
    fn3: OperatorFunction<B, C>,
    fn4: OperatorFunction<C, D>,
    fn5: OperatorFunction<D, E>,
    fn6: OperatorFunction<E, F>,
    fn7: OperatorFunction<F, G>,
    fn8: OperatorFunction<G, H>,
    fn9: OperatorFunction<H, I>
  ): Routine<I>;
  /**
   * See collectRoutines for documentation
   */
  <A, B, C, D, E, F, G, H, I>(
    fn1: Routine<A>,
    fn2: OperatorFunction<A, B>,
    fn3: OperatorFunction<B, C>,
    fn4: OperatorFunction<C, D>,
    fn5: OperatorFunction<D, E>,
    fn6: OperatorFunction<E, F>,
    fn7: OperatorFunction<F, G>,
    fn8: OperatorFunction<G, H>,
    fn9: OperatorFunction<H, I>,
    ...fns: OperatorFunction<any, any>[]
  ): Routine<{}>;
}
