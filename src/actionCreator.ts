import { ActionCreator, UnknownAction, UnknownActionCreator } from "types";

/*
 * Module with utils for creating and using actionCreators
 */

export function createActionCreator<Payload = void>(
  debugName: string
): ActionCreator<Payload>;
export function createActionCreator(debugName: string): UnknownActionCreator {
  const type = Symbol(debugName);

  const action = (payload?: any) => ({
    type,
    payload,
    meta: {
      qualifiers: []
    }
  });
  action.type = type;

  return action;
}
