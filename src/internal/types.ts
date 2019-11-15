import { ActionWithoutPayload } from 'rxbeach';
import { ActionWithPayload } from 'rxbeach/types/Action';

export type VoidPayload = void;

/**
 * Helper type for any action
 *
 * This type has payload as an optional, unknown field, and is useful if you
 * want to extract a possible `payload` from an action you don't know anything
 * about.
 */
export type UnknownAction = ActionWithoutPayload & { payload?: unknown };

export interface ActionCreatorCommon {
  readonly type: string;
}

/**
 * Helper type for action creator where only the returned action matters
 *
 * This type allows for inferring overlap of the payload type between multiple
 * action creators with different payloads.
 */
export interface UnknownActionCreatorWithPayload<Payload>
  extends ActionCreatorCommon {
  (payload?: any): ActionWithPayload<Payload>;
}

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
