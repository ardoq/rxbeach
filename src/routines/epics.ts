import { Action, VoidPayload, AnyAction } from "types/Action";
import { OperatorFunction } from "rxjs";
import { ActionCreator } from "types/ActionCreator";
import { ActionMiddleware } from "types/actionOperators";

/**
 * Define a multiplexing routine
 *
 * A multiplexing routine accepts actions and emits actions. There does not
 * need to be correspondence between the amount of actions accepted and emitted.
 *
 * Use a multiplexing routine when you need to hook your own actions into
 * stand alone / notification actions.
 *
 * Multiplexing routines should not rely on other streams. Do **not hook other
 * streams onto a multiplexing routine**.
 *
 * @param operator The routine itself, a simple operator that accepts actions
 *                 and emits actions
 * @param actions The actions to accept
 * @template `Payload` - The type of payload on the action creators
 */
export const epic = <Payload = VoidPayload>(
  operator: OperatorFunction<Action<Payload>, AnyAction>,
  ...actions: ActionCreator<Payload>[]
): ActionMiddleware<Action<Payload>> => ({
  types: actions.map(({ type }) => type),
  operator
});
