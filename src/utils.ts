import { Observable, OperatorFunction, MonoTypeOperatorFunction } from "rxjs";
import { map, filter, catchError } from "rxjs/operators";
import { Reducer, ReducerDefinition } from "reducer";
import { ActionWithPayload, AnyAction } from "types";

/**
 * Silences errors and subscribes the stream
 *
 * Errors are logged to console, and the stream will continue.
 *
 * @param stream$ The stream to subscribe and silence errors from
 */
export const subscribeAndGuard = (stream$: Observable<unknown>) =>
  stream$
    .pipe(
      catchError((error, stream) => {
        console.error("UNHANDLED ERROR IN STREAM", error);
        return stream;
      })
    )
    .subscribe();

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
 * Stream operator to filter only actions of specific types
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
 * @param targetTypes The types to filter for
 */
export const ofType = (
  ...targetTypes: symbol[]
): MonoTypeOperatorFunction<AnyAction> =>
  filter(({ type }) => targetTypes.indexOf(type) !== -1);

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
