import { ActionWithPayload, ActionWithoutPayload } from './Action';
import { ActionCreatorCommon, VoidPayload } from '../internal/types';

export interface ActionCreatorWithoutPayload extends ActionCreatorCommon {
  (): ActionWithoutPayload;
}

export interface ActionCreatorWithPayload<Payload> extends ActionCreatorCommon {
  (payload: Payload): ActionWithPayload<Payload>;
}

/**
 * A conditional type that dispatches between `ActionCreatorWithPayload` and
 * `ActionCreatorWithoutPayload` by comparing the `Payload` type to
 * `VoidPayload`
 *
 * Without a generic type, this defaults to `ActionCreatorWithoutPayload`.
 *
 * @template `Payload` - The payload type to dispatch on
 */
export type ActionCreator<Payload = VoidPayload> = Payload extends VoidPayload
  ? ActionCreatorWithoutPayload
  : ActionCreatorWithPayload<Payload>;

type ActionName = `[${string}] ${string}`;

export interface ActionCreatorFunc {
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
