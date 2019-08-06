import { Observable } from "rxjs";

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

export type VoidPayload = void;

export type Action<Payload = VoidPayload> = Payload extends VoidPayload
  ? ActionWithoutPayload
  : ActionWithPayload<Payload>;

export type AnyAction = Action<any>;

export type UnknownAction = ActionWithoutPayload & { payload?: any };

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

export interface UnknownActionCreator extends ActionCreatorCommon {
  (payload?: any): UnknownAction;
}

export type ActionDispatcher = (action: UnknownAction) => void;

export type ExtractPayload<
  ActionType extends ActionCreatorWithPayload<any>
> = ReturnType<ActionType>["payload"];
