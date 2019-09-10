import { VoidPayload } from "lib/types/Action";
import { ActionCreator, UnknownActionCreator } from "lib/types/ActionCreator";

/**
 * Create an action creator for a given payload
 *
 * @param debugName A name for debugging purposes
 * @template `Payload` - The payload type for the action
 * @returns An action creator function that accepts a payload as input, and
 *          returns a complete action object with that payload and a type unique
 *          to this action creator
 */
export function createActionCreator<Payload = VoidPayload>(
  debugName: string
): ActionCreator<Payload>;
/**
 * Untyped `createActionCreator`
 *
 * **You should not hit this function**, your code should hit the overload with
 * typed payload.
 */
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
