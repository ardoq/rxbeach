import { OperatorFunction, MonoTypeOperatorFunction } from 'rxjs';
import { map, filter } from 'rxjs/operators';
import { ActionWithPayload, Action } from 'rxbeach';
import {
  AnyAction,
  UnknownActionCreatorWithPayload,
  UnknownActionCreator,
  UnknownAction,
  Protected,
} from 'rxbeach/internal';
import { ActionWithoutPayload } from 'rxbeach/types/Action';

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
  ): OperatorFunction<AnyAction, Action<Payload>>;

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
    AnyAction,
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
    AnyAction,
    ActionWithoutPayload
  >;
}
export const ofType: OfType = ((
  ...targetTypes: UnknownActionCreator[]
): OperatorFunction<AnyAction, UnknownAction> => {
  const types = new Set(targetTypes.map(({ type }) => type));

  return filter((action: AnyAction) => types.has(action.type));
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
  Protected<Payload>
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
