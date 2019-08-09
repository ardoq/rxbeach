import {
  Observable,
  OperatorFunction,
  MonoTypeOperatorFunction,
  merge,
  pipe
} from "rxjs";
import { map, filter, catchError, share } from "rxjs/operators";
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

/**
 * Runs operators in parallel and merges their results
 *
 * For each operator, the returned observable is subscribed to a pipe from the
 * source observable with the operator. This makes it a bit like the `flatMap`
 * operator and the merge function, but on an operator level instead of value
 * or observable level.
 *
 * NB: Each operator will create a "copy" of the stream, so any operators
 *     before the `fork` operator, will be executed for each operator passed
 *     to `fork`. Because of this, you might want to use the `share` operator
 *
 * @param operators Operators to run in parallell and merge the results of
 */
const _fork = <T, R>(
  ...operators: OperatorFunction<T, R>[]
): OperatorFunction<T, R> => source =>
  new Observable(subscriber => {
    const observable = merge(
      ...operators.map(operator => source.pipe(operator))
    );

    return observable.subscribe(subscriber);
  });

/**
 * Runs operators in parallel and merges their results
 *
 * For each operator, the returned observable is subscribed to a pipe from the
 * source observable with the operator. This makes it a bit like the `flatMap`
 * operator and the merge function, but on an operator level instead of value
 * or observable level.
 *
 * This operator includes the `share` operator on the parent stream, to prevent
 * operators that are attached before this one from running multiple times
 *
 * @param operators Operators to run in parallell and merge the results of
 */
export const fork = <T, R>(
  ...operators: OperatorFunction<T, R>[]
): OperatorFunction<T, R> =>
  pipe(
    share(),
    _fork(...operators)
  );
