import { OperatorFunction, MonoTypeOperatorFunction } from 'rxjs';
import { map, filter } from 'rxjs/operators';
import { ActionWithPayload, Action, ActionCreator } from 'rxbeach';
import { AnyAction, VoidPayload } from 'rxbeach/internal';

//// Routines ////

/**
 * Stream operator to filter only actions of specific types
 *
 * ```
 * action$.pipe(
 *   ofTypes(anAction.type, anotherAction.type),
 *   tap(action => {
 *     // `action` is now guaranteed to be of anAction or anotherAction type
 *     // NB: `action` will have type `AnyAction`
 *   })
 * )
 * ```
 *
 * This function has **weak typings**. The output type of the operator function
 * will be `AnyAction`.
 *
 * @see ofType For a more strictly typed alternative
 * @param targetTypes The types to filter for
 */
export const ofTypes = (
  ...targetTypes: string[]
): MonoTypeOperatorFunction<AnyAction> => {
  const types = new Set(targetTypes);

  return filter(({ type }) => types.has(type));
};

/**
 * Stream operator to filter action of a specific type
 *
 * ```
 * action$.pipe(
 *   ofType(anAction),
 *   tap(action => {
 *     // `action` is now guaranteed to be of anAction type
 *   })
 * )
 * ```
 *
 * @see ofTypes For filtering of multiple types
 * @param actionCreator The actionCreator to extract type of
 */
export const ofType = <Payload = VoidPayload>(
  actionCreator: ActionCreator<Payload>
) =>
  filter(
    (action: AnyAction): action is Action<Payload> =>
      action.type === actionCreator.type
  );

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
): MonoTypeOperatorFunction<Action<any>> =>
  filter(({ meta: { namespace } }) => namespace === targetNamespace);
