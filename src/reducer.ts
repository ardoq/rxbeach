import { Action } from "types";
import { ActionCreator } from "actionCreator";

/**
 * Module with utils for creating and using reducers
 */

export type Reducer<State, Payload = void> = (
  previousState: State,
  action: Action<Payload>
) => State;

export type ReducerMap<State> = Map<symbol, Reducer<State, any>>;

type ReducerEntry<State, Payload = void> = [symbol, Reducer<State, Payload>];

export const reducer = <State, Payload = void>(
  actionType: ActionCreator<Payload>,
  reducer: Reducer<State, Payload>
): ReducerEntry<State, Payload> => [actionType.type, reducer];
