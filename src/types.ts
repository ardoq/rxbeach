import { Observable, OperatorFunction } from "rxjs";

export type VoidPayload = void;

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
> = ReturnType<ActionType>["payload"];

//// Action ////

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

//// ActionCreator ////

interface ActionCreatorCommon {
  type: symbol;
}

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

/**
 * Helper type for action creator where you need to handle both action creators
 * with and without payloads
 *
 * This type has payload as an optional argument to the action creator function
 * and has return type `UnknownAction`. It's useful when you need to define a
 * generic action creator that might create actions with or without actions.
 */
export interface UnknownActionCreator extends ActionCreatorCommon {
  (payload?: any): UnknownAction;
}

export type ActionOperator<InputAction, OutputAction> = {
  operator: OperatorFunction<InputAction, OutputAction>;
};

/**
 * ActionMiddleware are streaming operators that should run for specific sets
 * of actions
 */
export type ActionMiddleware<Action> = {
  types: symbol[];
  operator: OperatorFunction<Action, AnyAction>;
};

/**
 * ActionConsumers are streaming operators that should run for specific actions
 */
export type ActionConsumer<Payload> = {
  type: symbol;
  operator: OperatorFunction<Action<Payload>, unknown>;
};

export type AnyActionConsumer = {
  type: symbol;
  operator: OperatorFunction<any, unknown>;
};

/**
 * ActionCreatorConsumers are ActionCreators that also function as
 * ActionConsumers
 */
export type ActionCreatorConsumer<Payload> = ActionCreator<Payload> &
  ActionConsumer<Payload>;

export type AnyActionCreatorConsumer = ActionCreator<any> & AnyActionConsumer;
