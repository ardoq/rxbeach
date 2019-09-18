import { OperatorFunction, MonoTypeOperatorFunction } from 'rxjs';
import { map, filter } from 'rxjs/operators';
import { ActionWithPayload, AnyAction } from 'stream-patterns/types/Action';

//// Routines ////

/**
 * Stream operator to filter only actions of a specific type
 *
 * ```
 * action$.pipe(
 *   ofType(myAction.type),
 *   tap(action => {
 *     // `action` is now guaranteed to be of myAction type
 *     // NB: `action` will have type `AnyAction`
 *   })
 * )
 * ```
 *
 * This function has weak typings. The output type of the operator function
 * will be `AnyAction`.
 *
 * @param targetType The type to filter for
 */
export const ofType = (
  targetType: string
): MonoTypeOperatorFunction<AnyAction> =>
  filter(({ type }) => type === targetType);

/**
 * Stream operator to filter only actions of specific types
 *
 * This function has weak typings. The output type of the operator function
 * will be `AnyAction`.
 *
 * @param types A set of the types to filter for
 */
export const ofTypes = (
  types: Set<string>
): MonoTypeOperatorFunction<AnyAction> => filter(({ type }) => types.has(type));

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
