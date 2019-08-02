import { Observable } from "rxjs";

type Meta = {
  qualifiers: symbol[];
};

type ActionWithoutPayload = {
  type: symbol;
  meta: Meta;
};

export type ActionWithPayload<Payload> = ActionWithoutPayload & {
  payload: Payload;
};

export type VoidPayload = void;

export type Action<Payload = VoidPayload> = Payload extends VoidPayload
  ? ActionWithoutPayload
  : ActionWithPayload<Payload>;

export type AnyAction = Action<any>;

// Fix for unknown actions that may or may not have a payload. Fixes this error:
// Property 'payload' does not exist on type
//   '{ type: symbol; } | { type: symbol; payload: any; }'
export type UnknownAction = ActionWithoutPayload & { payload?: any };

// createChildActionStream relies on this being observable and not subject,
// but createRootDispatcher will need this to be a subject
export type ActionStream = Observable<Action<any>>;

interface ActionCreatorCommon {
  type: symbol;
}

export interface ActionCreatorWithoutPayload extends ActionCreatorCommon {
  (): ActionWithoutPayload;
}

export interface ActionCreatorWithPayload<Payload> extends ActionCreatorCommon {
  (payload: Payload): ActionWithPayload<Payload>;
}

export type ActionCreator<Payload = VoidPayload> = Payload extends VoidPayload
  ? ActionCreatorWithoutPayload
  : ActionCreatorWithPayload<Payload>;

export type ActionDispatcher = (action: UnknownAction) => void;

export type ExtractPayload<
  ActionType extends ActionCreatorWithPayload<any>
> = ReturnType<ActionType>["payload"];
