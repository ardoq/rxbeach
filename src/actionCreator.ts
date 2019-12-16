import { ActionCreatorWithoutPayload, ActionCreatorWithPayload } from 'rxbeach';

interface ActionCreatorFunc {
  /**
   * Create an action creator without a payload
   *
   * @param type A name for debugging purposes
   * @returns An action creator function that creates complete action objects with
   *          a type unique to this action creator
   */
  (type: string): ActionCreatorWithoutPayload;
  /**
   * Create an action creator with a given payload type
   *
   * @param type A name for debugging purposes
   * @template `Payload` - The payload type for the action
   * @returns An action creator function that accepts a payload as input, and
   *          returns a complete action object with that payload and a type unique
   *          to this action creator
   */
  <Payload>(type: string): ActionCreatorWithPayload<Payload>;
}

/**
 * Untyped `actionCreator`
 *
 * **You code should not hit this untyped overload**
 * If you see this message in your IDE, you should investigate why TS did not
 * recognize the generic, typed overload of this function.
 */
export const actionCreator: ActionCreatorFunc = (type: string) => {
  const action = (payload?: any) =>
    Object.freeze({
      type,
      payload,
      meta: Object.freeze({}),
    });
  action.type = type;

  return Object.freeze(action);
};
