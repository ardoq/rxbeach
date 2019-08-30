import { OperatorFunction, pipe } from "rxjs";
import { AnyAction, Action } from "./types/Action";
import { ActionCreator } from "./types/ActionCreator";
import { fork, _filterForMiddlewareOrConsumer } from "utils/operators";

/**
 * ActionMiddleware are streaming operators that should run for specific sets
 * of actions
 */
export type ActionMiddleware<Action> = {
  types: symbol[];
  operator: OperatorFunction<Action, AnyAction>;
};

/**
 * Type to use as return for OperatorFunctions to indicate they will never
 * emit anything.
 *
 * Cannot be void, as the operator might be used together with other operators
 * that actually emit something.
 */
export type NeverEmits = unknown;

/**
 * ActionConsumers are streaming operators that should run for specific actions,
 * but never emit anything.
 */
export type ActionConsumer<Payload> = {
  type: symbol;
  operator: OperatorFunction<Action<Payload>, NeverEmits>;
};

export type AnyActionConsumer = {
  type: symbol;
  operator: OperatorFunction<any, NeverEmits>;
};

/**
 * ActionCreatorConsumers are ActionCreators that also function as
 * ActionConsumers
 */
export type ActionCreatorConsumer<Payload> = ActionCreator<Payload> &
  ActionConsumer<Payload>;

export type AnyActionCreatorConsumer = ActionCreator<any> & AnyActionConsumer;

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
