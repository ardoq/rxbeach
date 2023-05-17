export type ActionName = `[${string}] ${string}`;

export type VoidPayload = void;

type Meta = {
  readonly namespace?: string;
};

export interface Action<Payload = void> {
  readonly type: ActionName;
  readonly meta: Meta;
  readonly payload: Payload;
}

/**
 * @deprecated use Action instead
 */
export type ActionWithoutPayload = Action<void>;
/**
 * @deprecated use Action instead
 */
export type ActionWithPayload<Payload> = Action<Payload>;
