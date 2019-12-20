import { OperatorFunction, MonoTypeOperatorFunction, of } from 'rxjs';
import { map, filter, withLatestFrom, flatMap } from 'rxjs/operators';
import { ActionWithPayload, ActionWithoutPayload } from 'rxbeach';
import {
  UnknownActionCreatorWithPayload,
  UnknownActionCreator,
  UnknownAction,
} from 'rxbeach/internal';

interface OfType {
  /**
   * Stream operator to filter specific actions that have overlapping payload
   *
   * ```
   * action$.pipe(
   *   ofType(anAction, anotherAction),
   *   tap(action => {
   *     // `action` is now guaranteed to be of the type overlap between
   *     // anAction and anotherAction
   *   })
   * )
   * ```
   *
   * @param targetTypes The types to filter for
   */
  <Payload>(
    ...targetTypes: UnknownActionCreatorWithPayload<Payload>[]
  ): OperatorFunction<UnknownAction, ActionWithPayload<Payload>>;

  /**
   * Stream operator to filter specific actions that have non-overlapping payload
   *
   * You might hit this overload even when there is overlap, in those cases, you
   * can specify the overlap manually with the generic argument.
   *
   * ```
   * action$.pipe(
   *   ofType(anAction, anotherAction),
   *   tap(action => {
   *     // `action` is now of type Action<{}>, meaning the payload field is
   *     // available, but not nothing in it is.
   *   })
   * )
   * ```
   *
   * @param targetTypes The types to filter for
   */
  (...targetTypes: UnknownActionCreatorWithPayload<{}>[]): OperatorFunction<
    UnknownAction,
    ActionWithPayload<{}>
  >;

  /**
   * Stream operator to filter specific actions that does not have payloads
   *
   * ```
   * action$.pipe(
   *   ofType(anAction, anotherAction),
   *   tap(action => {
   *     // `action` is now of type ActionWithoutPayload
   *   })
   * )
   * ```
   *
   * @param targetTypes The types to filter for
   */
  (...targetTypes: UnknownActionCreator[]): OperatorFunction<
    UnknownAction,
    ActionWithoutPayload
  >;
}
export const ofType: OfType = ((
  ...targetTypes: UnknownActionCreator[]
): OperatorFunction<UnknownAction, UnknownAction> => {
  const types = new Set(targetTypes.map(({ type }) => type));

  return filter((action: UnknownAction) => types.has(action.type));
}) as any; // Implementation is untyped

/**
 * Stream operator to extract the payload from an action
 *
 * @template `Payload` - The type of the payload, can be inferred if the stream
 *                       is typed, or explicitly set if the stream has `any`
 *                       type or the payload type is `any`
 */
export const extractPayload = <Payload>(): OperatorFunction<
  ActionWithPayload<Payload>,
  Payload
> => map(action => action.payload);

/**
 * Stream operator that filters for actions with the correct namespace
 *
 * @param namespace The namespace to filter for
 */
export const withNamespace = (
  targetNamespace: string
): MonoTypeOperatorFunction<UnknownAction> =>
  filter(({ meta: { namespace } }) => namespace === targetNamespace);

/**
 * Stream operator that carries the initial payload alongside the results
 * from the operator parameter
 *
 * ```
 * routine(
 *   extractPayload(),
 *   carry(map(payload => payload.foo))
 *   tap(([payload, foo]) => {
 *     // `payload.foo === foo` equals `true`
 *   })
 * )
 * ```
 *
 * @param operator The operator to execute
 */
export const carry = <Carried, Emitted>(
  operator: OperatorFunction<Carried, Emitted>
): OperatorFunction<Carried, [Carried, Emitted]> => observable =>
  observable.pipe(
    operator,
    withLatestFrom(observable, (emitted, carried) => [carried, emitted])
  );

/**
 * A utility operator for using pipes which need a value to be present
 * throughout the pipe.
 *
 * The main use for this operator is to provide context to `catchError`. `carry`
 * should be preferred where possible.
 *
 * Example:
 * ```ts
 * routine(
 *   ofType(myAction),
 *   apply(action => pipe(
 *     map(action => ...),
 *     tap(mapped => ...),
 *     catchError(() => {
 *       console.log('Error from action:', action);
 *     })
 *   ))
 * )
 * ```
 *
 * @param operator A function that returns an operator function
 */
export const apply = <P, R>(
  operator: (payload: P) => OperatorFunction<P, R>
): OperatorFunction<P, R> =>
  flatMap(payload => of(payload).pipe(operator(payload)));
