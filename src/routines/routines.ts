import { pipe, OperatorFunction } from "rxjs";
import { createActionCreator } from "actionCreator";
import { Action, VoidPayload } from "types/Action";
import {
  ActionCreatorConsumer,
  AnyActionCreatorConsumer
} from "actionOperators";
import { ignoreElements } from "rxjs/operators";

/**
 * Define a pure routine
 *
 * A pure routine is a bit like a function, it is invoked to perform a single
 * side effect. You should **not hook other streams onto a pure routine**, use a
 * saga that invokes a routine if you need to do that.
 *
 * This function provides typings for the routine, and creates a corresponding
 * action creator.
 *
 * Anything emitted from the operator will be discarded.
 *
 * @param operator The routine itself, a simple operator function that accepts
 *                 payloads
 */
export const routine = <Payload = VoidPayload>(
  debugName: string,
  operator: OperatorFunction<Action<Payload>, unknown>
): ActionCreatorConsumer<Payload> => {
  const def: Partial<AnyActionCreatorConsumer> = createActionCreator(debugName);
  def.operator = pipe(
    operator,
    ignoreElements()
  );

  return def as ActionCreatorConsumer<Payload>;
};
