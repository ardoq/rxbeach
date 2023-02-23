import { Observable } from 'rxjs';
import {
  ActionCreatorWithoutPayload,
  ActionCreatorWithPayload,
} from './ActionCreator';
import { UnknownAction } from '../internal/types';
import { ActionWithPayload } from './Action';
import { ObservableState } from '../observableState';

export type ActionStream = Observable<UnknownAction>;

export type ActionDispatcher = (
  action: UnknownAction,
  namespace?: string
) => void;

/**
 * Helper type for extracting the payload type from an action creator
 *
 * ```
 * type Payload = ExtractPayload<typeof myAction>;
 * ```
 */
export type ExtractPayload<ActionType extends ActionCreatorWithPayload<any>> =
  ReturnType<ActionType>['payload'];

/**
 * Assert that an action creator is of a specific type, and extract its payload
 * type
 */
export function isActionOfType<T = undefined>(
  creatorFn: ActionCreatorWithPayload<T> | ActionCreatorWithoutPayload,
  action: ActionWithPayload<unknown>
): action is ActionWithPayload<T> {
  const hasPayloadKey = 'payload' in action;
  const hasMetaKey = 'meta' in action;

  return action.type === creatorFn.type && hasPayloadKey && hasMetaKey;
}

/**
 * Type helper to infer the payload of an action creator.
 * This should be preferred over exporting the types separately.
 */
export type InferFromActionCreator<TActionCreator> =
  TActionCreator extends ActionCreatorWithPayload<infer TValueType>
    ? TValueType
    : TActionCreator extends ActionCreatorWithoutPayload
    ? void
    : never;

/**
 * Type helper to get the type of the observable "state".
 */
export type InferFromObservable<TObservable> = TObservable extends Observable<
  infer TValueType
>
  ? TValueType
  : TObservable extends ObservableState<infer TValueType>
  ? TValueType
  : never;
