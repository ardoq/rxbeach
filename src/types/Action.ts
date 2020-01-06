import { VoidPayload } from 'rxbeach/internal';

type Meta = {
  readonly namespace?: string;
};

export type ActionWithoutPayload = {
  readonly type: string;
  readonly meta: Meta;
};

export type ActionWithPayload<Payload> = ActionWithoutPayload & {
  readonly payload: Payload;
};

/**
 * A conditional type that dispatches between `ActionWithPayload` and
 * `ActionWithoutPayload` by comparing the `Payload` type to `VoidPayload`
 *
 * Without a generic type, this defaults to `ActionWithoutPayload`.
 *
 * @template `Payload` - The payload type to dispatch on
 */
export type Action<Payload = VoidPayload> = Payload extends VoidPayload
  ? ActionWithoutPayload
  : ActionWithPayload<Payload>;
