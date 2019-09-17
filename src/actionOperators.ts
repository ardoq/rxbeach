import { OperatorFunction, pipe } from "rxjs";
import { AnyAction, Action } from "./types/Action";
import { ActionCreator } from "./types/ActionCreator";
import { ActionStream } from "stream-patterns/types/helpers";
import {
  fork,
  _filterForActionOperator
} from "stream-patterns/utils/operators";
import { subscribeAndGuard } from "stream-patterns/utils/utils";

/**
 * MultiActionOperator are streaming operators that should run for specific sets
 * of actions.
 * Their emitted values will always be discarded.
 */
export type MultiActionOperator<Action> = {
  types: symbol[];
  operator: OperatorFunction<Action, unknown>;
};

/**
 * ActionConsumers are streaming operators that should run for specific actions.
 * Their emitted values will always be discarded.
 */
export type SingleActionOperator<Payload> = {
  type: symbol;
  operator: OperatorFunction<Action<Payload>, unknown>;
};

export type AnySingleActionOperator = {
  type: symbol;
  operator: OperatorFunction<any, unknown>;
};

/**
 * ActionCreatorConsumers are ActionCreators that also function as
 * ActionConsumers
 */
export type ActionCreatorOperator<Payload> = ActionCreator<Payload> &
  SingleActionOperator<Payload>;

export type AnyActionCreatorOperator = ActionCreator<any> &
  AnySingleActionOperator;

/**
 * Combine action operator definitions to a single operator
 *
 * Nothing will be emitted from this operator.
 *
 * @param definitions The action operator definitions that should be combined
 */
export const combineActionOperators = (
  ...definitions: (SingleActionOperator<any> | MultiActionOperator<any>)[]
): OperatorFunction<AnyAction, unknown> =>
  fork(
    ...definitions.map(definition =>
      pipe(
        _filterForActionOperator(definition),
        definition.operator
      )
    )
  );

export const registerActionOperators = (
  action$: ActionStream,
  actionOperators: OperatorFunction<AnyAction, unknown>
) => subscribeAndGuard(action$.pipe(actionOperators));
