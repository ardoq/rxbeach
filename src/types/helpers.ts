import { Observable } from 'rxjs';
import { ActionCreatorWithPayload } from './ActionCreator';
import { UnknownAction } from '../internal/types';

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
export type ExtractPayload<
  ActionType extends ActionCreatorWithPayload<any>
> = ReturnType<ActionType>['payload'];
