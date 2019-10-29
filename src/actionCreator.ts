import { ActionCreator } from 'rxbeach';
import { VoidPayload, UnknownActionCreator } from 'rxbeach/internal';

/**
 * Create an action creator with a given payload type
 *
 * @param type A name for debugging purposes
 * @template `Payload` - The payload type for the action
 * @returns An action creator function that accepts a payload as input, and
 *          returns a complete action object with that payload and a type unique
 *          to this action creator
 */
export function actionCreator<Payload = VoidPayload>(
  type: string
): ActionCreator<Payload>;

/**
 * Untyped `actionCreator`
 *
 * **You code should not hit this untyped overload**
 * If you see this message in your IDE, you should investigate why TS did not
 * recognize the generic, typed overload of this function.
 */
export function actionCreator(type: string): UnknownActionCreator {
  const action = (payload?: any) => ({
    type,
    payload,
    meta: {},
  });
  action.type = type;

  return action;
}
