import { ActionMeta, ActionWithoutPayload, ActionWithPayload } from "./types";

interface ActionCreatorBase<Type extends string> {
  type: Type;
}

/**
 * A function that creates action objects without payloads
 *
 * @template Type The type of the created action
 */
export interface ActionCreatorWithoutPayload<Type extends string>
  extends ActionCreatorBase<Type> {
  /**
   * Create an action object without payload
   */
  (): Readonly<ActionWithoutPayload<Type>>;
}

/**
 * A function that creates action objects with payloads
 *
 * @template Type The type of the created action
 * @template Payload The type of the payload
 */
export interface ActionCreatorWithPayload<Type extends string, Payload>
  extends ActionCreatorBase<Type> {
  /**
   * Create an action object with payload
   *
   * @param {Readonly<Payload>} The payload for the action object
   */
  (payload: Readonly<Payload>): Readonly<ActionWithPayload<Type, Payload>>;
}

/**
 * A function that creates action objects
 *
 * @template Type The type of the created action
 * @template Payload The type of the payload
 */
type ActionCreator<Type extends string, Payload> = Payload extends void
  ? ActionCreatorWithoutPayload<Type>
  : ActionCreatorWithPayload<Type, Payload>;

export default ActionCreator;
