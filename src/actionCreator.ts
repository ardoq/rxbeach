import { VoidPayload } from 'types/Action';
import { ActionCreator, UnknownActionCreator } from 'types/ActionCreator';

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
 * **You code should not hit this untyped overload**
 * If you see this message in your IDE, you should investigate why TS did not
 * recognize the generic, typed overload of this function.
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
