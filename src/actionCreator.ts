import { ActionCreator, UnknownActionCreator, VoidPayload } from "types";

export function createActionCreator<Payload = VoidPayload>(
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
