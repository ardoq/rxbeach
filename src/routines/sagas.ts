import { createActionCreator } from "actionCreator";
import {
  Action,
  VoidPayload,
  ActionCreatorConsumer,
  AnyAction,
  AnyActionCreatorConsumer
} from "types";
import { OperatorFunction } from "rxjs";

/**
 * Define a saga / data routine / action middleware
 *
 * A saga does one of the following
 *  - Provides data to other actions
 *  - Performs side effects where the result is needed for other actions
 *
 * Some concrete examples:
 *  - Providing context from `context$` to another action
 *  - Updating a model on the backend, and feeding the updated model to another
 *    function
 *
 * Sagas are the only routines that should have other streams hooked
 * onto them, but do not hook the action$ onto a saga. If you want to do that,
 * use an epic instead.
 *
 * @param operator The routine itself, a simple operator tha accepts actions and
 *                 emits actions
 */
export const saga = <Payload = VoidPayload>(
  debugName: string,
  operator: OperatorFunction<Action<Payload>, AnyAction>
): ActionCreatorConsumer<Payload> => {
  const definition: Partial<AnyActionCreatorConsumer> = createActionCreator<
    Payload
  >(debugName);

  definition.operator = operator;

  return definition as ActionCreatorConsumer<Payload>;
};
