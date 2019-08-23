export type VoidPayload = void;

type Meta = {
  qualifiers: symbol[];
};

export type ActionWithoutPayload = {
  type: symbol;
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
