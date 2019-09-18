import { VoidPayload } from 'stream-patterns/types/Action';
import {
  ActionCreator,
  UnknownActionCreator,
} from 'stream-patterns/types/ActionCreator';

/**
 * Create an action creator for a given payload
 *
 * @param type A name for debugging purposes
 * @template `Payload` - The payload type for the action
 * @returns An action creator function that accepts a payload as input, and
 *          returns a complete action object with that payload and a type unique
 *          to this action creator
 */
export function createActionCreator<Payload = VoidPayload>(
  type: string
): ActionCreator<Payload>;
/**
 * Untyped `createActionCreator`
 *
 * **You should not hit this function**, your code should hit the overload with
 * typed payload.
 */
export function createActionCreator(type: string): UnknownActionCreator {
  const action = (payload?: any) => ({
    type,
    payload,
    meta: {
      qualifiers: [],
    },
  });
  action.type = type;

  return action;
}
