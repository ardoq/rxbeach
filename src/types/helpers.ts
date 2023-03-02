import { Observable } from 'rxjs';
import {
  ActionCreator,
  ActionCreatorWithPayload,
  ActionCreatorWithoutPayload,
} from './ActionCreator';
import { UnknownAction } from '../internal/types';
import { Action, VoidPayload } from './Action';
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

/**
 * Type helper to infer the payload of an action creator.
 * This should be preferred over exporting the types separately.
 */
export type InferPayloadFromActionCreator<TActionCreator> =
  TActionCreator extends ActionCreatorWithPayload<infer TValueType>
    ? TValueType
    : TActionCreator extends ActionCreatorWithoutPayload
    ? void
    : never;

/**
 * Type helper to get the type of the value contained in the observable
 */
export type InferValueFromObservable<TObservable> =
  TObservable extends Observable<infer TValueType>
    ? TValueType
    : TObservable extends ObservableState<infer TValueType>
    ? TValueType
    : never;
