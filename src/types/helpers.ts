import { Observable } from 'rxjs';
import { ActionCreatorWithPayload } from 'rxbeach';
import { AnyAction, UnknownAction } from 'rxbeach/internal';

export type ActionStream = Observable<AnyAction>;

export type ActionDispatcher = (action: UnknownAction) => void;

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
