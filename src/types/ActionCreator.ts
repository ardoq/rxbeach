import type { Action, ActionName } from './Action';

/**
 * Type of the action creator functions
 *
 * @template `Payload` - The payload type to dispatch on
 */
export interface ActionCreator<Payload = void> {
  (payload: Payload): Action<Payload>;
  type: ActionName;
}

/**
 * @deprecated use ActionCreator instead
 */
export type ActionCreatorWithoutPayload = ActionCreator<void>;

/**
 * @deprecated use ActionCreator instead
 */
export type ActionCreatorWithPayload<Payload = void> = ActionCreator<Payload>;
