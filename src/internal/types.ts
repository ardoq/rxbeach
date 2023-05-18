import type { OperatorFunction } from 'rxjs';
import type { Action, ActionName, ActionWithPayload } from '../types/Action';

export { VoidPayload } from '../types/Action';

/**
 * Helper type for any action
 *
 * This type has payload as an optional, unknown field, and is useful if you
 * want to extract a possible `payload` from an action you don't know anything
 * about.
 */
export type UnknownAction = Action<unknown>;

export interface ActionCreatorCommon {
  readonly type: ActionName;
}

/**
 * Helper type for action creator where only the returned action matters
 *
 * This type allows for inferring overlap of the payload type between multiple
 * action creators with different payloads.
 *
 * @deprecated
 * v2.6.0 Use ActionCreator type instead
 */
export interface UnknownActionCreatorWithPayload<Payload>
  extends ActionCreatorCommon {
  (payload?: any): ActionWithPayload<Payload>;
}

/**
 * Helper type for action creator where you need to handle both action creators
 * with and without payloads
 *
 * This type has payload as an optional argument to the action creator function
 * and has return type `UnknownAction`. It's useful when you need to define a
 * generic action creator that might create actions with or without actions.
 *
 * @deprecated
 * v2.6.0 Use ActionCreator type instead
 */
export interface UnknownActionCreator extends ActionCreatorCommon {
  (payload?: any): UnknownAction;
}

export type Routine<T> = OperatorFunction<UnknownAction, T>;

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
  <A, B, C, D, E, F, G, H, I, J>(
    fn1: Routine<A>,
    fn2: OperatorFunction<A, B>,
    fn3: OperatorFunction<B, C>,
    fn4: OperatorFunction<C, D>,
    fn5: OperatorFunction<D, E>,
    fn6: OperatorFunction<E, F>,
    fn7: OperatorFunction<F, G>,
    fn8: OperatorFunction<G, H>,
    fn9: OperatorFunction<H, I>,
    fn10: OperatorFunction<I, J>
  ): Routine<J>;
  /**
   * See collectRoutines for documentation
   */
  <A, B, C, D, E, F, G, H, I, J>(
    fn1: Routine<A>,
    fn2: OperatorFunction<A, B>,
    fn3: OperatorFunction<B, C>,
    fn4: OperatorFunction<C, D>,
    fn5: OperatorFunction<D, E>,
    fn6: OperatorFunction<E, F>,
    fn7: OperatorFunction<F, G>,
    fn8: OperatorFunction<G, H>,
    fn9: OperatorFunction<H, I>,
    fn10: OperatorFunction<I, J>,
    ...fns: OperatorFunction<any, any>[]
  ): Routine<unknown>;
}
