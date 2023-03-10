import { Observable } from 'rxjs';
import {
  ActionCreatorWithPayload,
  ActionCreatorWithoutPayload,
} from './ActionCreator';
import { UnknownAction } from '../internal/types';
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
export type Observed<TObservable> = TObservable extends Observable<
  infer TValueType
>
  ? TValueType
  : TObservable extends ObservableState<infer TValueType>
  ? TValueType
  : never;
