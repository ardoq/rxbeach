import {
  FluxStandardAction,
  FluxStandardActionWithPayload
} from "flux-standard-action";
import ActionCreator from "./ActionCreator";
import Reducer from "./Reducer";

export type Optional<T> = T | undefined;
export type PossiblyArray<T> = T | T[];

/**
 * Standard meta for an action
 *
 * This meta is only used for debugging, and will be `undefined` when not
 * debugging
 */
export type ActionMeta = Optional<{
  callStack: Error;
  createdAt: Date;
}>;

export type ActionWithoutPayload<Type extends string> = Readonly<
  FluxStandardAction<Type, void, ActionMeta>
>;
export type ActionWithPayload<Type extends string, Payload> = Readonly<
  FluxStandardActionWithPayload<Type, Payload, ActionMeta>
>;
export type ActionMaybePayload<Type extends string, Payload> = Readonly<
  FluxStandardAction<Type, Payload, ActionMeta>
>;

export type ActionAuto<Type extends string, Payload> = Payload extends void
  ? ActionWithoutPayload<Type>
  : ActionWithPayload<Type, Payload>;

export type AnyActionWithoutPayload = ActionWithoutPayload<string>;
export type AnyActionWithPayload<Payload> = ActionWithPayload<string, Payload>;
export type AnyActionMaybePayload<Payload = any> = ActionMaybePayload<
  string,
  Payload
>;
export type AnyActionAuto<Payload> = ActionAuto<string, Payload>;

export type ExtractPayload<AC extends ActionCreator<any, any>> = ReturnType<
  AC
>["payload"];

export type InferredReducer<
  State,
  AC extends ActionCreator<any, any>
> = Reducer<State, ExtractPayload<AC>>;
