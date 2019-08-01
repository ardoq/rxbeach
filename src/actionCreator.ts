import { ActionCreator } from "types";

/*
 * Module with utils for creating and using actionCreators
 */

export const createActionCreator = <Payload = void>(
  debugName: string
): ActionCreator<Payload> => {
  const type = Symbol(debugName);

  const action = (payload?: Payload) => ({
    type,
    payload
  });
  action.type = type;

  // FIXME - type clash because of optional parameter, void vs undefined
  return action as ActionCreator<Payload>;
};
