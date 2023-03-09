import { Action, VoidPayload } from './types/Action';
import {
  ActionCreator,
  ActionCreatorWithPayload,
  ActionCreatorWithoutPayload,
} from './types/ActionCreator';

type ActionName = `[${string}] ${string}`;

interface ActionCreatorFunc {
  /**
   * Create an action creator without a payload
   *
   * @param type A name for debugging purposes
   * @returns An action creator function that creates complete action objects with
   *          a type unique to this action creator
   */
  (type: ActionName): ActionCreatorWithoutPayload;
  /**
   * Create an action creator with a given payload type
   *
   * @param type A name for debugging purposes
   * @template `Payload` - The payload type for the action
   * @returns An action creator function that accepts a payload as input, and
   *          returns a complete action object with that payload and a type unique
   *          to this action creator
   */
  <Payload>(type: ActionName): ActionCreatorWithPayload<Payload>;
}

/**
 * Untyped `actionCreator`
 *
 * **You code should not hit this untyped overload**
 * If you see this message in your IDE, you should investigate why TS did not
 * recognize the generic, typed overload of this function.
 */
export const actionCreator: ActionCreatorFunc = (type: string) => {
  const actionCreatorFn = (payload?: any) =>
    Object.freeze({
      type,
      payload,
      meta: Object.freeze({}),
    });
  actionCreatorFn.type = type;

  return Object.freeze(actionCreatorFn);
};

/**
 * Assert that a value is a valid rx beach action.
 * We assert that payload is a key in the object because this is what our
 * actionCreator performs
 */
export const isValidRxBeachAction = (
  action: unknown
): action is Action<unknown> => {
  if (!action || typeof action !== 'object') {
    return false;
  }

  return (
    'type' in action &&
    'meta' in action &&
    'payload' in action &&
    typeof action.type === 'string'
  );
};

/**
 * Assert that an action creator is of a specific type, and extract its payload
 * type
 */
export const isActionOfType = <T = VoidPayload>(
  creatorFn: ActionCreator<T>,
  action: unknown
): action is Action<T> => {
  if (!isValidRxBeachAction(action)) {
    return false;
  }

  return action.type === creatorFn.type;
};
