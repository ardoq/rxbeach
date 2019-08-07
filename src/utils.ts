import { Observable, OperatorFunction, MonoTypeOperatorFunction } from "rxjs";
import { map, filter } from "rxjs/operators";
import { Reducer, ReducerDefinition } from "reducer";
import { ActionWithPayload, AnyAction } from "types";

export const subscribeAndGuard = (stream$: Observable<unknown>) =>
  stream$.subscribe(
    () => null,
    (error: Error) => {
      console.error("UNHANDLED ERROR IN STREAM", error);

      // TODO is this needed? Inherited from ardoq subscribeAndGuard
      subscribeAndGuard(stream$);
    }
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
 * Stream operator to filter only actions of a specific type
 *
 * ```
 * action$.pipe(
 *   ofType(myAction.type),
 *   tap(action => {
 *     // Action is now guaranteed to be of myAction type
 *   })
 * )
 * ```
 *
 * This function has weak typings. The output type of the operator function
 * will be `AnyAction`.
 *
 * @param targetType The type of the action to filter for
 */
export const ofType = (
  targetType: symbol
): MonoTypeOperatorFunction<AnyAction> =>
  filter(({ type }) => type === targetType);

export const ofTypes = (types: symbol[]): MonoTypeOperatorFunction<AnyAction> =>
  filter(({ type }) => types.indexOf(type) !== -1);

/**
 * Extract the reducer from a reducer definition, for using the same reducer
 * in multiple definitions
 *
 * ```
 * export const aliasReducerAction = reducer(sameReducerFn(originalReducerAction));
 * ```
 *
 * @param ReducerDefinition The reducer definition to extract the reducer from
 */
export const sameReducerFn = <State, Payload>(
  ReducerDefinition: ReducerDefinition<State, Payload>
): Reducer<State, Payload> => ReducerDefinition.reducer[1];
