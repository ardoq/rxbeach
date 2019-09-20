import { VoidPayload } from 'rxbeach/internal';

type Meta = {
  namespace?: symbol;
};

export type ActionWithoutPayload = {
  type: string;
  meta: Meta;
};

export type ActionWithPayload<Payload> = ActionWithoutPayload & {
  payload: Payload;
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
