import { Action, ActionWithoutPayload } from 'rxbeach';

export type VoidPayload = void;

/**
 * Helper type for any action
 *
 * TypeScript will interpret this to a union type of `ActionWithPayload<any>`
 * and `ActionWithoutPayload`.
 *
 * Prefer this type when you need to handle actions that you don't know anything
 * about.
 */
export type AnyAction = Action<any>;

/**
 * Helper type for any action, where `AnyAction` doesn't suffice
 *
 * This type has payload as an optional field, and is useful if you want to
 * extract a possible `payload` from an action you don't know anything about.
 *
 * `AnyAction` is assignable to `UnknownAction` and vice versa.
 */
export type UnknownAction = ActionWithoutPayload & { payload?: any };

export interface ActionCreatorCommon {
  type: string;
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
