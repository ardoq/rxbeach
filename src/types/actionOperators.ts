import { OperatorFunction } from "rxjs";
import { AnyAction, Action } from "./Action";
import { ActionCreator } from "./ActionCreator";

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
