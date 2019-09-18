import {
  ActionWithoutPayload,
  ActionWithPayload,
  VoidPayload,
  UnknownAction,
} from './Action';

interface ActionCreatorCommon {
  type: string;
}

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

/**
 * Helper type for action creator where you need to handle both action creators
 * with and without payloads
 *
 * This type has payload as an optional argument to the action creator function
 * and has return type `UnknownAction`. It's useful when you need to define a
 * generic action creator that might create actions with or without actions.
 */
export interface UnknownActionCreator extends ActionCreatorCommon {
  (payload?: any): UnknownAction;
}
