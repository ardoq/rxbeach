import { OperatorFunction, MonoTypeOperatorFunction, merge, pipe } from "rxjs";
import { map, filter, share, tap } from "rxjs/operators";
import { ActionWithPayload, AnyAction } from "types/Action";
import {
  ActionConsumer,
  ActionMiddleware,
  NeverEmits
} from "types/actionOperators";

//// Routines ////

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
 * Runs operators in parallel and merges their results
 *
 * For each operator, the returned observable is subscribed to a pipe from the
 * source observable with the operator. This makes it a bit like the `flatMap`
 * operator and the merge function, but on an operator level instead of value
 * or observable level.
 *
 * NB: Each operator will create a "copy" of the stream, so any operators
 *     before the `coldFork` operator, will be executed for each operator passed
 *     to `coldFork`. Because of this, you might want to use the `fork`
 *     operator, which includes a `share` operator to make the upstream hot.
 *
 * @param operators Operators to run in parallell and merge the results of
 */
const coldFork = <T, R>(
  ...operators: OperatorFunction<T, R>[]
): OperatorFunction<T, R> => source =>
  merge(...operators.map(operator => source.pipe(operator)));

/**
 * Runs operators in parallel and merges their results
 *
 * For each operator, the returned observable is subscribed to a pipe from the
 * source observable with the operator. This makes it a bit like the `flatMap`
 * operator and the merge function, but on an operator level instead of value
 * or observable level.
 *
 * This operator includes the `share` operator on the parent stream, to prevent
 * operators that are attached before this one from running multiple times.
 *
 * @param operators Operators to run in parallell and merge the results of
 */
export const fork = <T, R>(
  ...operators: OperatorFunction<T, R>[]
): OperatorFunction<T, R> =>
  pipe(
    share(),
    coldFork(...operators)
  );

/**
 * Creates a stream operator that filters actions appropriate for the given
 * action consumer or action middleware
 *
 * @param definition The action consumer or action middleware
 */
export const _filterForMiddlewareOrConsumer = (
  definition: ActionConsumer<any> | ActionMiddleware<any>
) => {
  if ((definition as ActionConsumer<any>).type) {
    return ofType((definition as ActionConsumer<any>).type);
  } else {
    return ofType(...(definition as ActionMiddleware<any>).types);
  }
};

/**
 * Combine action operator definitions to a single operator
 *
 * Input actions to this operator will not be emitted from it, only the emitted
 * actions from the action operators will be emitted.
 *
 * @param definitions The action operator definitions that should be combined
 */
export const combineActionOperators = (
  ...definitions: (ActionConsumer<any> | ActionMiddleware<any>)[]
): OperatorFunction<AnyAction, NeverEmits> =>
  fork(
    ...definitions.map(definition =>
      pipe(
        _filterForMiddlewareOrConsumer(definition),
        definition.operator
      )
    )
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
