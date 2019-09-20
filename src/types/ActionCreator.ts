import { ActionWithoutPayload, ActionWithPayload } from 'rxbeach';
import { ActionCreatorCommon, VoidPayload } from 'rxbeach/internal';

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
