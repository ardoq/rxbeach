import { pipe, OperatorFunction } from "rxjs";
import { createActionCreator } from "actionCreator";
import { Action, VoidPayload } from "types/Action";
import {
  ActionCreatorOperator,
  AnyActionCreatorOperator
} from "actionOperators";
import { ignoreElements } from "rxjs/operators";

/**
 * Define an action routine - a routine with a corresponding action definition
 *
 * Action routines should be used to:
 * - Perform side effects from streams / with actions
 * - Provide extra data to streams / reducers / other actions
 *
 * In contrast to the `hookRoutine`, action routines can only be invoked
 * directly, with the action that is created by this function.
 *
 * Anything emitted from the operator will be discarded.
 *
 * @param operator The routine itself, a simple operator function that accepts
 *                 payloads
 * @template `Payload` - The type of payload to accept
 */
export const actionRoutine = <Payload = VoidPayload>(
  debugName: string,
  operator: OperatorFunction<Action<Payload>, unknown>
): ActionCreatorOperator<Payload> => {
  const def: Partial<AnyActionCreatorOperator> = createActionCreator(debugName);
  def.operator = pipe(
    operator,
    ignoreElements()
  );

  return def as ActionCreatorOperator<Payload>;
};